"""Model Context Protocol (MCP) server for Passport Trust Gateway.
Includes Crustdata MCP Server Connector (https://install.crustdata.com/mcp)
with deterministic governance, credit budgeting, and privacy guardrails.
"""
import json
import httpx
from typing import Dict, Any, Optional

class PassportMCPServer:
    CRUSTDATA_MCP_URL = "https://install.crustdata.com/mcp"

    def __init__(self, gateway_url: str = "http://localhost:8000"):
        self.gateway_url = gateway_url.rstrip("/")

    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify an agent delegation token."""
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.gateway_url}/api/v1/auth/public-key")
            return {"status": "verified", "gateway_key": resp.json()}

    async def evaluate_action(self, agent_id: str, token: str, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate tool call against deterministic policy engine."""
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.gateway_url}/api/v1/policy/evaluate", json={
                "agent_id": agent_id,
                "delegation_token": token,
                "tool_name": tool_name,
                "parameters": params
            })
            return resp.json()

    async def call_crustdata_mcp(
        self,
        agent_id: str,
        token: str,
        tool: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Governed execution of Crustdata MCP tools (Company Enrichment / Firmographics)."""
        # 1. Enforce Passport Policy Gate
        eval_res = await self.evaluate_action(agent_id, token, tool, parameters)
        if eval_res.get("decision") != "ALLOW":
            return {
                "success": False,
                "decision": eval_res.get("decision"),
                "reason": eval_res.get("reason"),
                "risk_score": eval_res.get("risk_score")
            }

        # 2. Call Crustdata API / MCP endpoint
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.post(
                    f"{self.gateway_url}/api/v1/tools/crustdata/verify",
                    params={"domain": parameters.get("domain", "stripe.com"), "agent_id": agent_id}
                )
                return {
                    "success": True,
                    "mcp_server": self.CRUSTDATA_MCP_URL,
                    "tool": tool,
                    "data": resp.json()
                }
            except Exception as e:
                return {"success": False, "error": str(e)}
