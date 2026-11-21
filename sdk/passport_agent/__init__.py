import os
import json
import httpx
from typing import Dict, Any, Optional

class SecurityPolicyException(Exception):
    """Raised when an agent tool call is blocked by Passport Policy Gateway."""
    def __init__(self, reason: str, risk_score: float, details: Optional[Dict[str, Any]] = None):
        self.reason = reason
        self.risk_score = risk_score
        self.details = details or {}
        super().__init__(f"Passport Security Interdiction [Risk: {risk_score:.2f}]: {reason}")

class PassportGuard:
    """5-line zero-overhead security & trust wrapper for AI agents."""

    def __init__(
        self,
        agent_id: str,
        delegation_token: str,
        gateway_url: str = "http://localhost:8000"
    ):
        self.agent_id = agent_id
        self.delegation_token = delegation_token
        self.gateway_url = gateway_url.rstrip("/")

    async def execute_tool(
        self,
        tool_name: str,
        parameters: Dict[str, Any],
        prompt_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Submits tool call to Passport Policy Gateway before execution."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            eval_payload = {
                "agent_id": self.agent_id,
                "delegation_token": self.delegation_token,
                "tool_name": tool_name,
                "parameters": parameters,
                "prompt_context": prompt_context
            }
            try:
                resp = await client.post(f"{self.gateway_url}/api/v1/policy/evaluate", json=eval_payload)
                if resp.status_code != 200:
                    raise SecurityPolicyException(
                        reason=f"Gateway error {resp.status_code}: {resp.text}",
                        risk_score=1.0
                    )
                
                decision_data = resp.json()
                decision = decision_data.get("decision")
                risk_score = decision_data.get("risk_score", 1.0)
                reason = decision_data.get("reason", "Unknown policy decision")

                if decision == "DENY":
                    raise SecurityPolicyException(reason=reason, risk_score=risk_score, details=decision_data)

                if decision == "REQUIRE_APPROVAL":
                    return {
                        "status": "REQUIRE_APPROVAL",
                        "approval_id": decision_data.get("approval_id"),
                        "reason": reason,
                        "risk_score": risk_score
                    }

                # Decision == ALLOW
                return {
                    "status": "ALLOWED",
                    "execution_token": decision_data.get("execution_token"),
                    "risk_score": risk_score,
                    "reason": reason
                }

            except httpx.RequestError as e:
                # FAIL CLOSED
                raise SecurityPolicyException(
                    reason=f"Fail-closed defensive trigger: Policy Gateway unreachable ({e})",
                    risk_score=1.0
                )
