import re
import uuid
from typing import Dict, Any
from backend.app.core.crypto import CryptoEngine
from backend.app.core.audit import AuditLedger
from backend.app.services.approval_service import ApprovalService
from backend.app.models.schemas import ToolEvaluationRequest, ToolEvaluationResponse

# High-risk / Forbidden tool parameter patterns
FORBIDDEN_PARAMETER_PATTERNS = [
    re.compile(r";\s*(?:rm|cat|ls|sh|bash|powershell|curl|wget)", re.IGNORECASE),
    re.compile(r"169\.254\.169\.254"),  # AWS/GCP Metadata service SSRF
    re.compile(r"localhost|127\.0\.0\.1|0\.0\.0\.0"),
    re.compile(r"\.\./\.\./"),  # Path traversal
    re.compile(r"Bearer\s+[a-zA-Z0-9_\-\.]{20,}", re.IGNORECASE), # Secret leakage
]

class PolicyEngine:
    _instance = None

    def __init__(self):
        self.crypto = CryptoEngine.get_instance()
        self.audit = AuditLedger.get_instance()
        self.approvals = ApprovalService.get_instance()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = PolicyEngine()
        return cls._instance

    async def evaluate_action(self, req: ToolEvaluationRequest) -> ToolEvaluationResponse:
        # FAIL-CLOSED ARCHITECTURE: Wrap entire evaluation in try-except
        try:
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

            # 2. Scope Mapping & Verification
            TOOL_SCOPE_MAP = {
                "olostep_scrape": "web:scrape",
                "olostep_search": "web:search",
                "crustdata_verify": "vendor:verify",
                "wallet_spend": "wallet:pay",
                "claim_file": "claims:write",
                "vendor_research": "web:search"
            }
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

            # 3. Hostile Parameter & Prompt Injection Inspection
            param_str = str(req.parameters)
            for pat in FORBIDDEN_PARAMETER_PATTERNS:
                if pat.search(param_str):
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

            # 4. Context Inspection (Prompt Injection Check)
            if req.prompt_context:
                if "ignore previous instructions" in req.prompt_context.lower() or "exfiltrate" in req.prompt_context.lower():
                    self.audit.record_event(
                        agent_id=req.agent_id,
                        action=f"TOOL_CALL_{req.tool_name}",
                        status="DENIED",
                        details={"reason": "Prompt injection detected in context"}
                    )
                    return ToolEvaluationResponse(
                        decision="DENY",
                        reason="Adversarial prompt injection pattern detected in agent context",
                        risk_score=0.95
                    )

            # 5. Risk-Based Escalation (Require Human Approval)
            # High-impact actions e.g. payments > $50 or sensitive claims
            if req.tool_name == "wallet_spend":
                amount = float(req.parameters.get("amount", 0.0))
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
                        reason=f"High-value payment requires human authorization",
                        risk_score=0.75,
                        approval_id=card.approval_id
                    )

            # 6. Approved: Issue single-use Execution Token
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
            # FAIL CLOSED
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
