import time
import pytest
from backend.app.core.crypto import CryptoEngine

def test_token_mint_and_verify():
    crypto = CryptoEngine.get_instance()
    token, jti, exp = crypto.mint_token(
        principal_id="user_test_01",
        agent_id="agent_alpha",
        scopes=["web:search", "web:scrape"],
        budget_limit=20.0,
        per_tx_limit=5.0
    )
    assert token.startswith("pst_")
    
    claims = crypto.verify_token(token)
    assert claims.agent_id == "agent_alpha"
    assert claims.sub == "user_test_01"
    assert "web:search" in claims.scopes
    assert claims.budget_limit == 20.0

def test_forged_token_rejected():
    crypto = CryptoEngine.get_instance()
    token, _, _ = crypto.mint_token(
        principal_id="user_test_01",
        agent_id="agent_alpha",
        scopes=["web:search"]
    )
    # Tamper with the token string
    tampered = token[:-4] + "xxxx"
    with pytest.raises(ValueError, match="signature verification failed|forged"):
        crypto.verify_token(tampered)

def test_revoked_token_rejected():
    crypto = CryptoEngine.get_instance()
    token, jti, _ = crypto.mint_token(
        principal_id="user_test_01",
        agent_id="agent_alpha",
        scopes=["web:search"]
    )
    # Revoke
    crypto.revoke_token(jti)
    with pytest.raises(ValueError, match="has been revoked"):
        crypto.verify_token(token)

def test_expired_token_rejected():
    crypto = CryptoEngine.get_instance()
    # Expired 10 seconds ago
    token, _, _ = crypto.mint_token(
        principal_id="user_test_01",
        agent_id="agent_alpha",
        scopes=["web:search"],
        expires_in_seconds=-10
    )
    with pytest.raises(ValueError, match="expired"):
        crypto.verify_token(token)
