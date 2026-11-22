import pytest
import time
import uuid
import json
from unittest.mock import patch, MagicMock
from backend.app.core.crypto import CryptoEngine
from backend.app.core.audit import AuditLedger
from backend.app.core.db import Database
from backend.app.services.policy_engine import PolicyEngine
from backend.app.services.wallet_service import SandboxedWallet
from backend.app.models.schemas import ToolEvaluationRequest, SpendRequest

@pytest.fixture
def test_setup():
    crypto = CryptoEngine.get_instance()
    policy = PolicyEngine.get_instance()
    audit = AuditLedger.get_instance()
    wallet = SandboxedWallet.get_instance()
    db = Database.get_instance()
    
    agent_id = f"resilience_agent_{uuid.uuid4().hex[:6]}"
    
    # Register agent in DB
    with db.get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO agents (
                agent_id, name, role, principal_id, max_daily_budget,
                single_tx_cap, allowed_scopes, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'));
            """,
            (agent_id, "Resilience Test Bot", "Test Runner", "user_admin", 50.0, 15.0, json.dumps(["web:scrape", "wallet:pay", "vendor:verify"]))
        )
        conn.commit()

    token, jti, _ = crypto.mint_token(
        principal_id="user_admin",
        agent_id=agent_id,
        scopes=["web:scrape", "wallet:pay", "vendor:verify"],
        budget_limit=50.0,
        per_tx_limit=15.0
    )
    
    return {
        "crypto": crypto,
        "policy": policy,
        "audit": audit,
        "wallet": wallet,
        "db": db,
        "agent_id": agent_id,
        "token": token,
        "jti": jti
    }

@pytest.mark.asyncio
async def test_fail_closed_on_unhandled_exception(test_setup):
    """Verifies that unexpected system exceptions cleanly default to DENY and record a FAIL_CLOSED audit block."""
    policy = test_setup["policy"]
    audit = test_setup["audit"]
    agent_id = test_setup["agent_id"]
    token = test_setup["token"]

    initial_blocks = audit.verify_integrity().total_events
    
    req = ToolEvaluationRequest(
        agent_id=agent_id,
        delegation_token=token,
        tool_name="olostep_scrape",
        parameters={"url": "https://example.com", "force_exception": True}
    )
    
    res = await policy.evaluate_action(req)
    
    assert res.decision == "DENY"
    assert "Fail-closed defensive trigger" in res.reason
    assert res.risk_score == 1.0
    
    # Verify audit block was logged with FAIL_CLOSED status
    events = audit.get_recent_entries(limit=5)
    fail_closed_events = [e for e in events if e.status == "FAIL_CLOSED" and e.agent_id == agent_id]
    assert len(fail_closed_events) >= 1
    assert "Simulated internal policy engine failure" in fail_closed_events[0].details["error"]

@pytest.mark.asyncio
async def test_fail_closed_on_tampered_token(test_setup):
    """Verifies that forged or modified delegation tokens are immediately denied without executing the tool."""
    policy = test_setup["policy"]
    agent_id = test_setup["agent_id"]
    token = test_setup["token"]

    # Tamper with token signature by modifying last 10 characters
    tampered_token = token[:-10] + "XXXXXXXXXX"
    
    req = ToolEvaluationRequest(
        agent_id=agent_id,
        delegation_token=tampered_token,
        tool_name="olostep_scrape",
        parameters={"url": "https://example.com"}
    )
    
    res = await policy.evaluate_action(req)
    assert res.decision == "DENY"
    assert "Token verification failed" in res.reason
    assert res.risk_score == 1.0

@pytest.mark.asyncio
async def test_fail_closed_on_emergency_agent_kill_switch(test_setup):
    """Verifies that an agent marked SUSPENDED or KILLED has all actions denied immediately."""
    policy = test_setup["policy"]
    db = test_setup["db"]
    agent_id = test_setup["agent_id"]
    token = test_setup["token"]

    # Suspend agent via database / kill switch
    with db.get_connection() as conn:
        conn.execute("UPDATE agents SET status = 'SUSPENDED' WHERE agent_id = ?;", (agent_id,))
        conn.commit()
    policy.update_agent_status_cache(agent_id, "SUSPENDED")

    req = ToolEvaluationRequest(
        agent_id=agent_id,
        delegation_token=token,
        tool_name="olostep_scrape",
        parameters={"url": "https://example.com"}
    )
    
    res = await policy.evaluate_action(req)
    assert res.decision == "DENY"
    assert "Emergency Kill Switch active" in res.reason
    assert "SUSPENDED" in res.reason
    assert res.risk_score == 1.0

@pytest.mark.asyncio
async def test_fail_closed_on_vendor_network_timeout(test_setup):
    """Simulates an external partner API timeout or crash during vendor verification and verifies fail-closed denial."""
    policy = test_setup["policy"]
    agent_id = test_setup["agent_id"]
    token = test_setup["token"]

    req = ToolEvaluationRequest(
        agent_id=agent_id,
        delegation_token=token,
        tool_name="wallet_spend",
        parameters={"amount": 8.50, "merchant": "unresponsive-vendor.io"}
    )

    # Mock Crustdata risk analyzer to raise a network timeout error
    with patch.object(policy.crustdata, "evaluate_vendor", side_effect=TimeoutError("Connection to vendor API timed out after 5000ms")):
        res = await policy.evaluate_action(req)
        assert res.decision == "DENY"
        assert "Fail-closed defensive trigger" in res.reason

@pytest.mark.asyncio
async def test_fail_closed_on_corrupted_payload(test_setup):
    """Verifies that corrupted payloads and non-dictionary parameters fail closed cleanly."""
    policy = test_setup["policy"]
    agent_id = test_setup["agent_id"]
    token = test_setup["token"]

    req = ToolEvaluationRequest(
        agent_id=agent_id,
        delegation_token=token,
        tool_name="olostep_scrape",
        parameters={"corrupted": True}
    )
    res = await policy.evaluate_action(req)
    assert res.decision == "DENY"
    assert "Corrupted tool request payload" in res.reason

@pytest.mark.asyncio
async def test_fail_closed_on_budget_exhaustion(test_setup):
    """Verifies that per-transaction caps and daily budgets fail closed and don't allow overspending."""
    wallet = test_setup["wallet"]
    agent_id = test_setup["agent_id"]
    token = test_setup["token"]

    # Test 1: Single transaction cap ($100 > $15 per-tx cap)
    req_over_cap = SpendRequest(
        agent_id=agent_id,
        delegation_token=token,
        amount=100.00,
        merchant_domain="api.vendor.com",
        purpose="Massive compute purchase"
    )
    res_cap = await wallet.execute_spend(req_over_cap)
    assert res_cap.success is False
    assert "exceeds per-transaction limit" in res_cap.reason

    # Test 2: Sequential spends up to $50 budget
    # Spend 5 x $10 = $50
    for i in range(5):
        spend_res = await wallet.execute_spend(SpendRequest(
            agent_id=agent_id,
            delegation_token=token,
            amount=10.00,
            merchant_domain="api.vendor.com",
            purpose=f"Legit task credit {i}"
        ))
        assert spend_res.success is True

    # Test 3: 6th spend attempts to exceed $50 daily budget
    res_exhausted = await wallet.execute_spend(SpendRequest(
        agent_id=agent_id,
        delegation_token=token,
        amount=5.00,
        merchant_domain="api.vendor.com",
        purpose="Over-budget attempt"
    ))
    assert res_exhausted.success is False
    assert "exceed total authorized budget" in res_exhausted.reason
