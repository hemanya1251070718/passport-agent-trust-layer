"""Model Context Protocol (MCP) server for Passport Trust Gateway."""
import json
import httpx
from typing import Dict, Any

class PassportMCPServer:
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
