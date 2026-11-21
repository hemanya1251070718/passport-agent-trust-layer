import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_api_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["audit_ledger_valid"] is True

@pytest.mark.asyncio
async def test_api_mint_and_evaluate_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Mint token
        mint_resp = await ac.post("/api/v1/auth/mint", json={
            "agent_id": "agent-api-test",
            "scopes": ["web:scrape", "wallet:pay"],
            "budget_limit": 30.0,
            "per_tx_limit": 10.0
        })
        assert mint_resp.status_code == 200
        mint_data = mint_resp.json()
        token = mint_data["token"]
        assert token.startswith("pst_")

        # 2. Evaluate allowed tool call
        eval_resp = await ac.post("/api/v1/policy/evaluate", json={
            "agent_id": "agent-api-test",
            "delegation_token": token,
            "tool_name": "olostep_scrape",
            "parameters": {"url": "https://example.com/refund"}
        })
        assert eval_resp.status_code == 200
        eval_data = eval_resp.json()
        assert eval_data["decision"] == "ALLOW"
        assert eval_data["execution_token"] is not None

        # 3. Evaluate disallowed tool call (scope escalation)
        unauth_resp = await ac.post("/api/v1/policy/evaluate", json={
            "agent_id": "agent-api-test",
            "delegation_token": token,
            "tool_name": "claim_file", # requires claims:write scope
            "parameters": {"claim_id": "999"}
        })
        assert unauth_resp.status_code == 200
        unauth_data = unauth_resp.json()
        assert unauth_data["decision"] == "DENY"

        # 4. Verify audit ledger
        audit_resp = await ac.get("/api/v1/audit/verify")
        assert audit_resp.status_code == 200
        assert audit_resp.json()["valid"] is True
