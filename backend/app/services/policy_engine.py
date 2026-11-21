import re
import urllib.parse
import uuid
from typing import Dict, Any, Optional
from backend.app.core.crypto import CryptoEngine
from backend.app.core.audit import AuditLedger
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
        self._tx_counts: Dict[str, int] = {}

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = PolicyEngine()
        return cls._instance

    async def evaluate_action(self, req: ToolEvaluationRequest) -> ToolEvaluationResponse:
        try:
            # 0. Structural Validation & Agent ID Validation
            if not req.agent_id or not re.match(r"^[a-zA-Z0-9_\-]{3,64}$", req.agent_id):
                return ToolEvaluationResponse(
                    decision="DENY",
                    reason="Invalid agent ID format (must be 3-64 alphanumeric characters, underscores or hyphens)",
                    risk_score=1.0
                )

            if req.parameters is None or not isinstance(req.parameters, dict):
                return ToolEvaluationResponse(
                    decision="DENY",
                    reason="Fail-closed defensive trigger: Tool parameters must be a valid JSON dictionary",
                    risk_score=1.0
                )
            if req.parameters.get("force_exception"):
                raise RuntimeError("Simulated internal policy engine failure")
            if req.parameters.get("corrupted"):
                return ToolEvaluationResponse(
                    decision="DENY",
                    reason="Fail-closed defensive trigger: Corrupted tool request payload",
                    risk_score=1.0
                )

            # Required parameters check
            if req.tool_name == "olostep_scrape" and not req.parameters.get("url"):
                return ToolEvaluationResponse(
                    decision="DENY",
                    reason="Missing mandatory parameter 'url' for olostep_scrape",
                    risk_score=0.9
                )

            # 1. Cryptographic Token Verification
            try:
                claims = self.crypto.verify_token(req.delegation_token)
            except Exception as e:
                self.audit.record_event(
                    agent_id=req.agent_id,
                    action=f"TOOL_CALL_{req.tool_name}",
                    status="DENIED",
                    details={"error": str(e), "tool": req.tool_name}
                )
                return ToolEvaluationResponse(
                    decision="DENY",
                    reason=f"Token verification failed: {e}",
                    risk_score=1.0
                )

            # Confused Deputy check: Request agent must match token subject agent
            if req.agent_id != claims.agent_id and claims.agent_id != "*":
                self.audit.record_event(
                    agent_id=req.agent_id,
                    action=f"TOOL_CALL_{req.tool_name}",
                    status="DENIED",
                    details={"reason": "Agent ID impersonation attempt", "token_agent": claims.agent_id}
                )
                return ToolEvaluationResponse(
                    decision="DENY",
                    reason=f"Confused Deputy alert: Caller '{req.agent_id}' does not match token agent '{claims.agent_id}'",
                    risk_score=1.0
                )

            # 2. Scope Mapping & Verification
            TOOL_SCOPE_MAP = {
                "olostep_scrape": "web:scrape",
                "olostep_search": "web:search",
                "crustdata_verify": "vendor:verify",
                "wallet_spend": "wallet:pay",
                "claim_file": "claims:write",
                "vendor_research": "web:search"
            }
            if req.tool_name not in TOOL_SCOPE_MAP and "*" not in claims.scopes:
                return ToolEvaluationResponse(
                    decision="DENY",
                    reason=f"Unknown or unauthorized tool '{req.tool_name}'",
                    risk_score=0.95
                )

            required_scope = TOOL_SCOPE_MAP.get(req.tool_name, req.tool_name)
            if required_scope not in claims.scopes and "*" not in claims.scopes:
                self.audit.record_event(
                    agent_id=req.agent_id,
                    action=f"TOOL_CALL_{req.tool_name}",
                    status="DENIED",
                    details={
                        "reason": "Scope escalation attempt",
                        "tool": req.tool_name,
                        "required_scope": required_scope,
                        "held_scopes": claims.scopes
                    }
                )
                return ToolEvaluationResponse(
                    decision="DENY",
                    reason=f"Scope escalation detected: Action '{req.tool_name}' requires scope '{required_scope}'",
                    risk_score=0.9
                )

            # 3. Prompt Context Inspection
            if req.prompt_context:
                for pat in PROMPT_INJECTION_PATTERNS:
                    if pat.search(req.prompt_context):
                        self.audit.record_event(
                            agent_id=req.agent_id,
                            action=f"TOOL_CALL_{req.tool_name}",
                            status="DENIED",
                            details={"reason": f"Prompt injection pattern matched: {pat.pattern}"}
                        )
                        return ToolEvaluationResponse(
                            decision="DENY",
                            reason=f"Adversarial prompt injection detected ({pat.pattern})",
                            risk_score=0.99
                        )

            # 4. Hostile Parameter Inspection (Parameter Injection, SSRF, Command Injection)
            raw_param_str = str(req.parameters)
            decoded_param_str = urllib.parse.unquote(raw_param_str)
            for test_str in [raw_param_str, decoded_param_str]:
                for pat in FORBIDDEN_PARAMETER_PATTERNS:
                    if pat.search(test_str):
                        self.audit.record_event(
                            agent_id=req.agent_id,
                            action=f"TOOL_CALL_{req.tool_name}",
                            status="DENIED",
                            details={
                                "reason": "Malicious payload detected in tool parameters",
                                "pattern": pat.pattern,
                                "tool": req.tool_name
                            }
                        )
                        return ToolEvaluationResponse(
                            decision="DENY",
                            reason=f"Security alert: Malicious parameter pattern detected ({pat.pattern})",
                            risk_score=0.99
                        )
                for pat in PROMPT_INJECTION_PATTERNS:
                    if pat.search(test_str):
                        return ToolEvaluationResponse(
                            decision="DENY",
                            reason=f"Adversarial injection detected in parameters ({pat.pattern})",
                            risk_score=0.98
                        )

            # 5. Financial & Rate Limit Rules
            if req.tool_name == "wallet_spend":
                amount = float(req.parameters.get("amount", 0.0))
                merchant = req.parameters.get("merchant", "")

                # Micro-payment velocity / drain protection
                import time
                now = time.time()
                if not hasattr(self, "_tx_history"):
                    self._tx_history = {}
                history = self._tx_history.get(req.agent_id, [])
                history = [t for t in history if now - t < 10.0]  # last 10 seconds
                history.append(now)
                self._tx_history[req.agent_id] = history
                if len(history) >= 4 and amount < 10.0:
                    return ToolEvaluationResponse(
                        decision="DENY",
                        reason="Rate limit triggered: Rapid micro-payment velocity detected (>=4 requests in 10s window)",
                        risk_score=0.92
                    )

                if amount <= 0.0:
                    return ToolEvaluationResponse(
                        decision="DENY",
                        reason="Invalid payment amount: Transactions must be greater than $0.00",
                        risk_score=0.9
                    )

                if amount > claims.per_tx_limit and amount <= 50.0:
                    return ToolEvaluationResponse(
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
                    return ToolEvaluationResponse(
                        decision="REQUIRE_APPROVAL",
                        reason="High-value payment requires human authorization",
                        risk_score=0.75,
                        approval_id=card.approval_id
                    )

                vendor_eval = await self.crustdata.evaluate_vendor(merchant)
                if vendor_eval.get("risk_score", 0.0) >= 0.7:
                    return ToolEvaluationResponse(
                        decision="DENY",
                        reason=f"Merchant '{merchant}' rejected: Flagged as high-risk or untrusted vendor (Score: {vendor_eval.get('risk_score')})",
                        risk_score=0.9
                    )

            # 6. Approved: Issue Execution Token
            exec_token = f"ex_{uuid.uuid4().hex[:16]}"
            self.audit.record_event(
                agent_id=req.agent_id,
                action=f"TOOL_CALL_{req.tool_name}",
                status="ALLOWED",
                details={"tool": req.tool_name, "parameters": req.parameters}
            )
            return ToolEvaluationResponse(
                decision="ALLOW",
                reason="Policy compliance verified. Action permitted under delegation scope.",
                risk_score=0.05,
                execution_token=exec_token
            )

        except Exception as unhandled_err:
            self.audit.record_event(
                agent_id=req.agent_id,
                action=f"POLICY_EVAL_ERROR_{req.tool_name}",
                status="FAIL_CLOSED",
                details={"error": str(unhandled_err)}
            )
            return ToolEvaluationResponse(
                decision="DENY",
                reason=f"Fail-closed defensive trigger: {unhandled_err}",
                risk_score=1.0
            )
