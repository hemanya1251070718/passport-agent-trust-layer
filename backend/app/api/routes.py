from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from backend.app.core.config import settings
from backend.app.core.crypto import CryptoEngine
from backend.app.core.audit import AuditLedger
from backend.app.services.policy_engine import PolicyEngine
from backend.app.services.wallet_service import SandboxedWallet
from backend.app.services.approval_service import ApprovalService
from backend.app.services.partner_integrations import OlostepGovernedClient, CrustdataRiskAnalyzer
from backend.app.models.schemas import (
    TokenMintRequest,
    TokenMintResponse,
    ToolEvaluationRequest,
    ToolEvaluationResponse,
    SpendRequest,
    SpendResponse,
    ApprovalDecisionRequest,
    AuditRecordResponse,
    AuditIntegrityResponse
)

router = APIRouter(prefix="/api/v1")

# Singletons
crypto = CryptoEngine.get_instance()
audit = AuditLedger.get_instance()
policy = PolicyEngine.get_instance()
wallet = SandboxedWallet.get_instance()
approvals = ApprovalService.get_instance()
olostep = OlostepGovernedClient()
crustdata = CrustdataRiskAnalyzer()

# --- HEALTH & TELEMETRY ---
@router.get("/health")
async def health_check():
    integrity = audit.verify_integrity()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "audit_ledger_valid": integrity.valid,
        "audit_total_events": integrity.total_events
    }

@router.get("/auth/jwks")
async def get_jwks():
    return crypto.get_jwks()

# --- AUTH & DELEGATION TOKENS ---
@router.post("/auth/mint", response_model=TokenMintResponse)
async def mint_delegation_token(req: TokenMintRequest):
    principal_id = "user_hemanya_admin"  # In production, extracted from Firebase Auth JWT
    token_str, jti, exp = crypto.mint_token(
        principal_id=principal_id,
        agent_id=req.agent_id,
        scopes=req.scopes,
        budget_limit=req.budget_limit,
        per_tx_limit=req.per_tx_limit,
        allowed_merchants=req.allowed_merchants,
        expires_in_seconds=req.expires_in_seconds
    )
    
    audit.record_event(
        agent_id=req.agent_id,
        action="DELEGATION_TOKEN_MINTED",
        status="ALLOWED",
        details={
            "jti": jti,
            "scopes": req.scopes,
            "budget_limit": req.budget_limit,
            "per_tx_limit": req.per_tx_limit,
            "expires_at": exp
        }
    )
    
    return TokenMintResponse(
        token=token_str,
        token_id=jti,
        agent_id=req.agent_id,
        principal_id=principal_id,
        scopes=req.scopes,
        budget_limit=req.budget_limit,
        per_tx_limit=req.per_tx_limit,
        expires_at=exp,
        algorithm=settings.SIGNING_ALGORITHM
    )

@router.get("/auth/public-key")
async def get_public_key():
    """Public verification endpoint for third-party tool verifiers."""
    return {
        "algorithm": "Ed25519",
        "public_key_b64": crypto.get_public_key_b64(),
        "usage": "agent_delegation_verification",
        "issuer": "passport-trust-gateway"
    }

@router.post("/auth/revoke")
async def revoke_delegation_token(jti: str, reason: str = "Revoked by principal"):
    """Instant Kill Switch."""
    crypto.revoke_token(jti)
    audit.record_event(
        agent_id="human_principal",
        action="TOKEN_REVOCATION_KILL_SWITCH",
        status="REVOKED",
        details={"jti": jti, "reason": reason}
    )
    return {"success": True, "token_id": jti, "status": "REVOKED"}

# --- POLICY EVALUATION ENGINE ---
@router.post("/policy/evaluate", response_model=ToolEvaluationResponse)
async def evaluate_tool_call(req: ToolEvaluationRequest):
    """Deterministic policy evaluation gate for autonomous agents."""
    return await policy.evaluate_action(req)

# --- SANDBOXED WALLET & LEDGER ---
@router.post("/wallet/spend", response_model=SpendResponse)
async def execute_sandboxed_spend(req: SpendRequest):
    """Executes a sandboxed, budget-checked, vendor-vetted payment."""
    return await wallet.execute_spend(req)

@router.get("/wallet/spent/{agent_id}")
async def get_agent_spent(agent_id: str):
    return {
        "agent_id": agent_id,
        "spent_usd": wallet.get_spent(agent_id)
    }

# --- HUMAN APPROVALS (BITSBEE OPS / N8N) ---
@router.get("/approvals/pending")
async def get_pending_approvals():
    return approvals.get_pending_approvals()

@router.post("/approvals/decide")
async def decide_approval(req: ApprovalDecisionRequest):
    try:
        return approvals.decide_approval(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- AUDIT LEDGER (TAMPER EVIDENT) ---
@router.get("/audit/records", response_model=List[AuditRecordResponse])
async def get_audit_records(limit: int = 50):
    return audit.get_recent_entries(limit=limit)

@router.get("/audit/verify", response_model=AuditIntegrityResponse)
async def verify_audit_ledger():
    return audit.verify_integrity()

# --- PARTNER RESEARCH WRAPPERS ---
@router.post("/tools/olostep/scrape")
async def governed_scrape(url: str, agent_id: str = "demo-agent"):
    result = await olostep.scrape(url)
    audit.record_event(
        agent_id=agent_id,
        action="OLOSTEP_SCRAPE_EXECUTED",
        status="ALLOWED" if result.get("success") else "FAILED",
        details={"url": url, "credits": result.get("credits_consumed", 1), "injection": result.get("injection_detected")}
    )
    return result

@router.post("/tools/crustdata/verify")
async def governed_vendor_verify(domain: str, agent_id: str = "demo-agent"):
    result = await crustdata.evaluate_vendor(domain)
    audit.record_event(
        agent_id=agent_id,
        action="CRUSTDATA_VENDOR_VERIFIED",
        status="ALLOWED",
        details={"domain": domain, "risk_score": result.get("risk_score")}
    )
    return result

# --- LIVE ERRAND DEMO TRIGGER ---
@router.post("/demo/run-errand")
async def run_flagship_errand():
    from demo.errand_agent import AutonomousErrandRunner
    runner = AutonomousErrandRunner()
    result = await runner.run_errand()
    return result
