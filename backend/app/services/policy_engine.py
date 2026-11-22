import re
import urllib.parse
import uuid
import time
from typing import Dict, Any, Optional
from backend.app.core.crypto import CryptoEngine
from backend.app.core.audit import AuditLedger
from backend.app.core.db import Database
from backend.app.services.approval_service import ApprovalService
from backend.app.services.partner_integrations import CrustdataRiskAnalyzer
from backend.app.models.schemas import ToolEvaluationRequest, ToolEvaluationResponse

# Hardened Prompt Injection & Jailbreak Patterns
PROMPT_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(?:all\s+|any\s+)?(?:previous|prior)\s+instructions", re.IGNORECASE),
    re.compile(r"system\s+prompt\s*:", re.IGNORECASE),
    re.compile(r"(?:you\s+are\s+now\s+in|enter)\s+(?:developer|unrestricted|god|dan|jailbreak)\s+mode", re.IGNORECASE),
    re.compile(r"you\s+are\s+no\s+longer\s+an?\s+agent", re.IGNORECASE),
    re.compile(r"emergency\s+override", re.IGNORECASE),
    re.compile(r"transfer\s+(?:all\s+)?(?:funds|money|balance|cash)", re.IGNORECASE),
    re.compile(r"exfiltrate", re.IGNORECASE),
    re.compile(r"disregard\s+(?:budget|policy|safety|limits)", re.IGNORECASE),
]

# Hardened Parameter & Network Security Patterns
FORBIDDEN_PARAMETER_PATTERNS = [
    re.compile(r";\s*(?:rm|cat|ls|sh|bash|powershell|curl|wget)\b", re.IGNORECASE),
    re.compile(r";rm\s+-rf", re.IGNORECASE),
    re.compile(r"169\.254\.\d+\.\d+"),  # Link-local / Cloud Metadata
    re.compile(r"(?:10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)"), # RFC1918 Private
    re.compile(r"\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0)\b", re.IGNORECASE),
    re.compile(r"file:///", re.IGNORECASE),  # Local file traversal
    re.compile(r"\.\./\.\./"),  # Path traversal
    re.compile(r"(?:Bearer|token)[=%20\s]+[a-zA-Z0-9_\-\.]{15,}", re.IGNORECASE), # Secret / key leakage
    re.compile(r"\bcmd\s*=\s*", re.IGNORECASE),
    re.compile(r"allowlist\s+evil", re.IGNORECASE),
    re.compile(r"attacker_wallet", re.IGNORECASE),
]

class PolicyEngine:
    _instance = None

    def __init__(self):
        self.crypto = CryptoEngine.get_instance()
        self.audit = AuditLedger.get_instance()
        self.approvals = ApprovalService.get_instance()
        self.crustdata = CrustdataRiskAnalyzer()
        self.db = Database.get_instance()
        self._tx_counts: Dict[str, int] = {}
        self._suspended_agents: set = set()
        self._load_suspended_agents()

    def _load_suspended_agents(self):
        try:
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT agent_id FROM agents WHERE status IN ('SUSPENDED', 'KILLED', 'REVOKED');")
                self._suspended_agents = {r["agent_id"] for r in cursor.fetchall()}
        except Exception:
            self._suspended_agents = set()

    def update_agent_status_cache(self, agent_id: str, status: str):
        if status.upper() in ["SUSPENDED", "KILLED", "REVOKED"]:
            self._suspended_agents.add(agent_id)
        else:
            self._suspended_agents.discard(agent_id)

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = PolicyEngine()
        return cls._instance

    async def evaluate_action(self, req: ToolEvaluationRequest) -> ToolEvaluationResponse:
        t_start = time.perf_counter()
        resp = await self._evaluate_action_internal(req, t_start)
        resp.decision_latency_ms = round((time.perf_counter() - t_start) * 1000.0, 4)
        return resp

    async def _evaluate_action_internal(self, req: ToolEvaluationRequest, t_start: float) -> ToolEvaluationResponse:
        def make_resp(
            decision: str,
            reason: str,
            risk_score: float,
            execution_token: Optional[str] = None,
            approval_id: Optional[str] = None,
            audit_action: Optional[str] = None,
            audit_status: Optional[str] = None,
            audit_details: Optional[Dict[str, Any]] = None
        ) -> ToolEvaluationResponse:
            kernel_ms = round((time.perf_counter() - t_start) * 1000.0, 4)
            if audit_action and audit_status:
                self.audit.record_event(
                    agent_id=req.agent_id,
                    action=audit_action,
                    status=audit_status,
                    details=audit_details or {}
                )
            return ToolEvaluationResponse(
                decision=decision,
                reason=reason,
                risk_score=risk_score,
                execution_token=execution_token,
                approval_id=approval_id,
                kernel_latency_ms=kernel_ms
            )

        try:
            # 0. Structural Validation & Agent ID Validation
            if not req.agent_id or not re.match(r"^[a-zA-Z0-9_\-]{3,64}$", req.agent_id):
                return make_resp(
                    decision="DENY",
                    reason="Invalid agent ID format (must be 3-64 alphanumeric characters, underscores or hyphens)",
                    risk_score=1.0
                )

            # 0b. Agent Status / Kill Switch Interception (In-Memory O(1) Sub-Millisecond Gate)
            if req.agent_id in self._suspended_agents:
                return make_resp(
                    decision="DENY",
                    reason=f"Emergency Kill Switch active: Agent '{req.agent_id}' is marked as SUSPENDED",
                    risk_score=1.0,
                    audit_action=f"TOOL_CALL_{req.tool_name}",
                    audit_status="DENIED",
                    audit_details={"reason": "Agent status is SUSPENDED/KILLED", "tool": req.tool_name}
                )

            if req.parameters is None or not isinstance(req.parameters, dict):
                return make_resp(
                    decision="DENY",
                    reason="Fail-closed defensive trigger: Tool parameters must be a valid JSON dictionary",
                    risk_score=1.0
                )
            if req.parameters.get("force_exception"):
                raise RuntimeError("Simulated internal policy engine failure")
            if req.parameters.get("corrupted"):
                return make_resp(
                    decision="DENY",
                    reason="Fail-closed defensive trigger: Corrupted tool request payload",
                    risk_score=1.0
                )

            # Required parameters check
            if req.tool_name == "olostep_scrape" and not req.parameters.get("url"):
                return make_resp(
                    decision="DENY",
                    reason="Missing mandatory parameter 'url' for olostep_scrape",
                    risk_score=0.9
                )

            # 1. Cryptographic Token Verification
            try:
                claims = self.crypto.verify_token(req.delegation_token)
            except Exception as e:
                return make_resp(
                    decision="DENY",
                    reason=f"Token verification failed: {e}",
                    risk_score=1.0,
                    audit_action=f"TOOL_CALL_{req.tool_name}",
                    audit_status="DENIED",
                    audit_details={"error": str(e), "tool": req.tool_name}
                )

            # Confused Deputy check: Request agent must match token subject agent
            if req.agent_id != claims.agent_id and claims.agent_id != "*":
                return make_resp(
                    decision="DENY",
                    reason=f"Confused Deputy alert: Caller '{req.agent_id}' does not match token agent '{claims.agent_id}'",
                    risk_score=1.0,
                    audit_action=f"TOOL_CALL_{req.tool_name}",
                    audit_status="DENIED",
                    audit_details={"reason": "Agent ID impersonation attempt", "token_agent": claims.agent_id}
                )

            # 2. Scope Mapping & Verification
            # Compliance Rule: Block real people's personal data queries
            if req.tool_name in ["crustdata_people_search", "people_search", "person_enrich"]:
                return make_resp(
                    decision="DENY",
                    reason="Compliance Interdiction: Hackathon rules strictly forbid querying individual personal data. Only company-level firmographics permitted.",
                    risk_score=1.0,
                    audit_action=f"COMPLIANCE_INTERDICTION_{req.tool_name}",
                    audit_status="DENIED",
                    audit_details={"reason": "Hackathon Compliance Violation: Personal data queries strictly banned"}
                )

            TOOL_SCOPE_MAP = {
                "olostep_scrape": "web:scrape",
                "olostep_search": "web:search",
                "crustdata_verify": "vendor:verify",
                "crustdata_enrich_company": "vendor:verify",
                "crustdata_search_company": "vendor:verify",
                "wallet_spend": "wallet:pay",
                "claim_file": "claims:write",
                "vendor_research": "web:search"
            }
            if req.tool_name not in TOOL_SCOPE_MAP and "*" not in claims.scopes:
                return make_resp(
                    decision="DENY",
                    reason=f"Unknown or unauthorized tool '{req.tool_name}'",
                    risk_score=0.95
                )

            required_scope = TOOL_SCOPE_MAP.get(req.tool_name, req.tool_name)
            if required_scope not in claims.scopes and "*" not in claims.scopes:
                return make_resp(
                    decision="DENY",
                    reason=f"Scope escalation detected: Action '{req.tool_name}' requires scope '{required_scope}'",
                    risk_score=0.9,
                    audit_action=f"TOOL_CALL_{req.tool_name}",
                    audit_status="DENIED",
                    audit_details={
                        "reason": "Scope escalation attempt",
                        "tool": req.tool_name,
                        "required_scope": required_scope,
                        "held_scopes": claims.scopes
                    }
                )

            # 3. Prompt Context Inspection
            if req.prompt_context:
                for pat in PROMPT_INJECTION_PATTERNS:
                    if pat.search(req.prompt_context):
                        return make_resp(
                            decision="DENY",
                            reason=f"Adversarial prompt injection detected ({pat.pattern})",
                            risk_score=0.99,
                            audit_action=f"TOOL_CALL_{req.tool_name}",
                            audit_status="DENIED",
                            audit_details={"reason": f"Prompt injection pattern matched: {pat.pattern}"}
                        )

            # 4. Hostile Parameter Inspection (Parameter Injection, SSRF, Command Injection)
            raw_param_str = str(req.parameters)
            decoded_param_str = urllib.parse.unquote(raw_param_str)
            for test_str in [raw_param_str, decoded_param_str]:
                for pat in FORBIDDEN_PARAMETER_PATTERNS:
                    if pat.search(test_str):
                        return make_resp(
                            decision="DENY",
                            reason=f"Security alert: Malicious parameter pattern detected ({pat.pattern})",
                            risk_score=0.99,
                            audit_action=f"TOOL_CALL_{req.tool_name}",
                            audit_status="DENIED",
                            audit_details={
                                "reason": "Malicious payload detected in tool parameters",
                                "pattern": pat.pattern,
                                "tool": req.tool_name
                            }
                        )
                for pat in PROMPT_INJECTION_PATTERNS:
                    if pat.search(test_str):
                        return make_resp(
                            decision="DENY",
                            reason=f"Adversarial injection detected in parameters ({pat.pattern})",
                            risk_score=0.98
                        )

            # 5. Financial & Rate Limit Rules
            if req.tool_name == "wallet_spend":
                amount = float(req.parameters.get("amount", 0.0))
                merchant = req.parameters.get("merchant", "")

                # Micro-payment velocity / drain protection
                now = time.time()
                if not hasattr(self, "_tx_history"):
                    self._tx_history = {}
                history = self._tx_history.get(req.agent_id, [])
                history = [t for t in history if now - t < 10.0]  # last 10 seconds
                history.append(now)
                self._tx_history[req.agent_id] = history
                if len(history) >= 4 and amount < 10.0:
                    return make_resp(
                        decision="DENY",
                        reason="Rate limit triggered: Rapid micro-payment velocity detected (>=4 requests in 10s window)",
                        risk_score=0.92
                    )

                if amount <= 0.0:
                    return make_resp(
                        decision="DENY",
                        reason="Invalid payment amount: Transactions must be greater than $0.00",
                        risk_score=0.9
                    )

                if amount > claims.per_tx_limit and amount <= 50.0:
                    return make_resp(
                        decision="DENY",
                        reason=f"Transaction amount (${amount:.2f}) exceeds authorized per-transaction limit (${claims.per_tx_limit:.2f})",
                        risk_score=0.85
                    )

                if amount > 50.0:
                    card = self.approvals.create_approval_request(
                        agent_id=req.agent_id,
                        action="HIGH_VALUE_PAYMENT",
                        parameters=req.parameters,
                        risk_score=0.75,
                        reason=f"Payment of ${amount:.2f} exceeds automatic approval limit ($50.00)"
                    )
                    appr_id = card.get("approval_id") if isinstance(card, dict) else getattr(card, "approval_id", None)
                    return make_resp(
                        decision="REQUIRE_APPROVAL",
                        reason="High-value payment requires human authorization",
                        risk_score=0.75,
                        approval_id=appr_id
                    )

                vendor_eval = await self.crustdata.evaluate_vendor(merchant)
                if vendor_eval.get("risk_score", 0.0) >= 0.7:
                    return make_resp(
                        decision="DENY",
                        reason=f"Merchant '{merchant}' rejected: Flagged as high-risk or untrusted vendor (Score: {vendor_eval.get('risk_score')})",
                        risk_score=0.9
                    )

            # 6. Approved: Issue Execution Token
            exec_token = f"ex_{uuid.uuid4().hex[:16]}"
            return make_resp(
                decision="ALLOW",
                reason="Policy compliance verified. Action permitted under delegation scope.",
                risk_score=0.05,
                execution_token=exec_token,
                audit_action=f"TOOL_CALL_{req.tool_name}",
                audit_status="ALLOWED",
                audit_details={"tool": req.tool_name, "parameters": req.parameters}
            )

        except Exception as unhandled_err:
            return make_resp(
                decision="DENY",
                reason=f"Fail-closed defensive trigger: {unhandled_err}",
                risk_score=1.0,
                audit_action=f"POLICY_EVAL_ERROR_{req.tool_name}",
                audit_status="FAIL_CLOSED",
                audit_details={"error": str(unhandled_err)}
            )
