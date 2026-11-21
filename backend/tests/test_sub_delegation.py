import pytest
from backend.app.core.crypto import CryptoEngine

def test_attenuated_sub_delegation():
    crypto = CryptoEngine.get_instance()
    
    # 1. Principal mints master token for Lead Errand Agent
    parent_token, parent_jti, parent_exp = crypto.mint_token(
        principal_id="principal_admin",
        agent_id="agent_lead_errand",
        scopes=["olostep:scrape", "crustdata:enrich", "wallet:pay"],
        budget_limit=25.0,
        per_tx_limit=10.0,
        expires_in_seconds=3600
    )
    
    # 2. Lead Agent delegates attenuated subset to Sub-Agent
    child_token, child_jti, p_jti, child_exp = crypto.mint_sub_delegation(
        parent_token_str=parent_token,
        sub_agent_id="agent_sub_scraper",
        scopes=["olostep:scrape"],  # Attenuated subset
        budget_limit=5.0,           # Attenuated budget
        per_tx_limit=5.0,
        expires_in_seconds=1800     # Shorter TTL
    )
    
    assert p_jti == parent_jti
    assert child_exp <= parent_exp
    
    # 3. Verify Child Token
    child_claims = crypto.verify_token(child_token)
    assert child_claims.agent_id == "agent_sub_scraper"
    assert child_claims.parent_jti == parent_jti
    assert child_claims.scopes == ["olostep:scrape"]
    assert child_claims.budget_limit == 5.0

def test_sub_delegation_scope_attenuation_violation():
    crypto = CryptoEngine.get_instance()
    
    # Parent has ONLY olostep:scrape
    parent_token, _, _ = crypto.mint_token(
        principal_id="principal_admin",
        agent_id="agent_lead",
        scopes=["olostep:scrape"],
        budget_limit=20.0
    )
    
    # Child attempts to escalate privileges by requesting wallet:pay!
    with pytest.raises(ValueError, match="Scope attenuation violation"):
        crypto.mint_sub_delegation(
            parent_token_str=parent_token,
            sub_agent_id="agent_sub_rogue",
            scopes=["olostep:scrape", "wallet:pay"],  # Escalation!
            budget_limit=5.0
        )

def test_sub_delegation_budget_attenuation_violation():
    crypto = CryptoEngine.get_instance()
    
    parent_token, _, _ = crypto.mint_token(
        principal_id="principal_admin",
        agent_id="agent_lead",
        scopes=["olostep:scrape"],
        budget_limit=10.0
    )
    
    # Child attempts to allocate $50 budget when parent only has $10!
    with pytest.raises(ValueError, match="Budget attenuation violation"):
        crypto.mint_sub_delegation(
            parent_token_str=parent_token,
            sub_agent_id="agent_sub_greedy",
            scopes=["olostep:scrape"],
            budget_limit=50.0
        )

def test_cascading_revocation_in_delegation_tree():
    crypto = CryptoEngine.get_instance()
    
    parent_token, parent_jti, _ = crypto.mint_token(
        principal_id="principal_admin",
        agent_id="agent_lead",
        scopes=["olostep:scrape"],
        budget_limit=20.0
    )
    
    child_token, child_jti, _, _ = crypto.mint_sub_delegation(
        parent_token_str=parent_token,
        sub_agent_id="agent_sub",
        scopes=["olostep:scrape"],
        budget_limit=5.0
    )
    
    # Both are currently valid
    assert crypto.verify_token(parent_token) is not None
    assert crypto.verify_token(child_token) is not None
    
    # Revoke parent token!
    crypto.revoke_token(parent_jti, reason="Parent compromised")
    
    # Both parent AND child must now be rejected!
    with pytest.raises(ValueError, match="has been revoked"):
        crypto.verify_token(parent_token)
        
    with pytest.raises(ValueError, match="has been revoked"):
        crypto.verify_token(child_token)
