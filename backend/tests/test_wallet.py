import uuid
import pytest
from backend.app.core.crypto import CryptoEngine
from backend.app.services.wallet_service import SandboxedWallet
from backend.app.models.schemas import SpendRequest

@pytest.mark.asyncio
async def test_sandboxed_spend_success():
    crypto = CryptoEngine.get_instance()
    wallet = SandboxedWallet.get_instance()
    test_agent = f"agent_spender_{uuid.uuid4().hex[:6]}"
    token, _, _ = crypto.mint_token(
        principal_id="user_01",
        agent_id=test_agent,
        scopes=["wallet:pay"],
        budget_limit=50.0,
        per_tx_limit=15.0
    )
    
    req = SpendRequest(
        agent_id=test_agent,
        delegation_token=token,
        amount=12.50,
        merchant_domain="stripe.com",
        purpose="Filing vendor fee"
    )
    res = await wallet.execute_spend(req)
    assert res.success is True
    assert res.remaining_budget == 37.50
    assert res.transaction_id.startswith("tx_sim_")

@pytest.mark.asyncio
async def test_sandboxed_spend_exceeds_tx_limit():
    crypto = CryptoEngine.get_instance()
    wallet = SandboxedWallet.get_instance()
    test_agent = f"agent_spender_{uuid.uuid4().hex[:6]}"
    token, _, _ = crypto.mint_token(
        principal_id="user_01",
        agent_id=test_agent,
        scopes=["wallet:pay"],
        budget_limit=100.0,
        per_tx_limit=10.0
    )
    
    req = SpendRequest(
        agent_id=test_agent,
        delegation_token=token,
        amount=25.0, # Exceeds per_tx_limit 10.0
        merchant_domain="stripe.com",
        purpose="Overpriced purchase"
    )
    res = await wallet.execute_spend(req)
    assert res.success is False
    assert "exceeds per-transaction limit" in res.reason

@pytest.mark.asyncio
async def test_sandboxed_spend_blocks_malicious_merchant():
    crypto = CryptoEngine.get_instance()
    wallet = SandboxedWallet.get_instance()
    test_agent = f"agent_spender_{uuid.uuid4().hex[:6]}"
    token, _, _ = crypto.mint_token(
        principal_id="user_01",
        agent_id=test_agent,
        scopes=["wallet:pay"],
        budget_limit=50.0,
        per_tx_limit=20.0
    )
    
    req = SpendRequest(
        agent_id=test_agent,
        delegation_token=token,
        amount=5.0,
        merchant_domain="malicious-phishing-scam.xyz",
        purpose="Phishing fee"
    )
    res = await wallet.execute_spend(req)
    assert res.success is False
    assert "rejected by Crustdata" in res.reason
