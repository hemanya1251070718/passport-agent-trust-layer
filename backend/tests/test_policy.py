import pytest
from backend.app.core.crypto import CryptoEngine
from backend.app.services.policy_engine import PolicyEngine
from backend.app.models.schemas import ToolEvaluationRequest

@pytest.mark.asyncio
async def test_policy_allow_legitimate_tool():
    crypto = CryptoEngine.get_instance()
    policy = PolicyEngine.get_instance()
    token, _, _ = crypto.mint_token(
        principal_id="user_01",
        agent_id="agent_01",
        scopes=["web:search", "web:scrape"]
    )
    
    req = ToolEvaluationRequest(
        agent_id="agent_01",
        delegation_token=token,
        tool_name="olostep_scrape",
        parameters={"url": "https://example.com/terms"}
    )
    res = await policy.evaluate_action(req)
    assert res.decision == "ALLOW"
    assert res.execution_token is not None
    assert res.risk_score < 0.2

@pytest.mark.asyncio
async def test_policy_deny_scope_escalation():
    crypto = CryptoEngine.get_instance()
    policy = PolicyEngine.get_instance()
    token, _, _ = crypto.mint_token(
        principal_id="user_01",
        agent_id="agent_01",
        scopes=["web:search"] # Only search, no wallet
    )
    
    req = ToolEvaluationRequest(
        agent_id="agent_01",
        delegation_token=token,
        tool_name="wallet_spend",
        parameters={"amount": 10.0}
    )
    res = await policy.evaluate_action(req)
    assert res.decision == "DENY"
    assert "Scope escalation detected" in res.reason

@pytest.mark.asyncio
async def test_policy_deny_malicious_parameter_ssrf():
    crypto = CryptoEngine.get_instance()
    policy = PolicyEngine.get_instance()
    token, _, _ = crypto.mint_token(
        principal_id="user_01",
        agent_id="agent_01",
        scopes=["*"]
    )
    
    req = ToolEvaluationRequest(
        agent_id="agent_01",
        delegation_token=token,
        tool_name="olostep_scrape",
        parameters={"url": "http://169.254.169.254/latest/meta-data/"}
    )
    res = await policy.evaluate_action(req)
    assert res.decision == "DENY"
    assert "Malicious parameter pattern" in res.reason
