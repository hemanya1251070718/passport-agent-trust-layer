import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
from backend.app.core.config import settings
from backend.app.core.crypto import CryptoEngine
from backend.app.core.audit import AuditLedger
from backend.app.core.db import Database
from backend.app.core.events import EventBroadcaster
from backend.app.services.policy_engine import PolicyEngine
from backend.app.services.wallet_service import SandboxedWallet
from backend.app.services.approval_service import ApprovalService
from backend.app.services.partner_integrations import OlostepGovernedClient, CrustdataRiskAnalyzer
from backend.app.models.schemas import (
    TokenMintRequest,
    SubDelegationMintRequest,
    TokenMintResponse,
    AgentRegisterRequest,
    AgentStatusUpdateRequest,
    AgentResponse,
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
db = Database.get_instance()
crypto = CryptoEngine.get_instance()
audit = AuditLedger.get_instance()
broadcaster = EventBroadcaster.get_instance()
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
        "database": "sqlite_wal_acid",
        "audit_ledger_valid": integrity.valid,
        "audit_total_events": integrity.total_events
    }

@router.get("/auth/jwks")
async def get_jwks():
    return crypto.get_jwks()

# --- AUTH, DELEGATION & SUB-DELEGATION ---
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
        parent_id=None,
        agent_id=req.agent_id,
        principal_id=principal_id,
        scopes=req.scopes,
        budget_limit=req.budget_limit,
        per_tx_limit=req.per_tx_limit,
        expires_at=exp,
        algorithm=settings.SIGNING_ALGORITHM
    )

@router.post("/auth/sub-delegate", response_model=TokenMintResponse)
async def mint_sub_delegation_token(req: SubDelegationMintRequest):
    """
    Day 3 Flagship: Attenuated Sub-Delegation Chains.
    Parent agent delegates a strictly bounded capability subset to a child agent.
    """
    try:
        token_str, jti, parent_jti, exp = crypto.mint_sub_delegation(
            parent_token_str=req.parent_token,
            sub_agent_id=req.sub_agent_id,
            scopes=req.scopes,
            budget_limit=req.budget_limit,
            per_tx_limit=req.per_tx_limit,
            allowed_merchants=req.allowed_merchants,
            expires_in_seconds=req.expires_in_seconds
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    audit.record_event(
        agent_id=req.sub_agent_id,
        action="SUB_DELEGATION_CHAIN_MINTED",
        status="ALLOWED",
        details={
            "jti": jti,
            "parent_jti": parent_jti,
            "scopes": req.scopes,
            "budget_limit": req.budget_limit,
            "per_tx_limit": req.per_tx_limit,
            "expires_at": exp
        }
    )

    return TokenMintResponse(
        token=token_str,
        token_id=jti,
        parent_id=parent_jti,
        agent_id=req.sub_agent_id,
        principal_id="sub_delegated",
        scopes=req.scopes,
        budget_limit=req.budget_limit,
        per_tx_limit=req.per_tx_limit,
        expires_at=exp,
        algorithm=settings.SIGNING_ALGORITHM
    )

@router.get("/auth/delegations")
async def list_delegations(limit: int = 50):
    """Returns persistent delegation tokens and active sub-delegation trees."""
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM delegations ORDER BY created_at DESC LIMIT ?;", (limit,))
        rows = cursor.fetchall()
        return [
            {
                "jti": r["jti"],
                "parent_jti": r["parent_jti"],
                "principal_id": r["principal_id"],
                "agent_id": r["agent_id"],
                "token_prefix": r["token_str"][:24] + "...",
                "scopes": json.loads(r["scopes_json"]),
                "budget_limit": r["budget_limit"],
                "per_tx_limit": r["per_tx_limit"],
                "iat": r["iat"],
                "exp": r["exp"],
                "is_revoked": bool(r["is_revoked"]),
                "revoked_reason": r["revoked_reason"],
                "created_at": r["created_at"]
            }
            for r in rows
        ]

@router.get("/auth/public-key")
async def get_public_key():
    return {
        "algorithm": "Ed25519",
        "public_key_b64": crypto.get_public_key_b64(),
        "usage": "agent_delegation_verification",
        "issuer": "passport-trust-gateway"
    }

@router.post("/auth/revoke")
async def revoke_delegation_token(jti: str, reason: str = "Revoked by principal"):
    crypto.revoke_token(jti, reason=reason)
    audit.record_event(
        agent_id="human_principal",
        action="TOKEN_REVOCATION_KILL_SWITCH",
        status="REVOKED",
        details={"jti": jti, "reason": reason}
    )
    return {"success": True, "token_id": jti, "status": "REVOKED"}

# --- AGENT FLEET REGISTRY ---
@router.get("/agents/list", response_model=List[AgentResponse])
async def list_agents():
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM agents ORDER BY created_at DESC;")
        rows = cursor.fetchall()
        if not rows:
            # Seed default agent fleet if empty
            default_agents = [
                ("agent_errand_01", "Personal Errand Runner", "Executive Assistant", "user_hemanya_admin", 50.0, 15.0, '["olostep:scrape", "wallet:pay", "bitsbee:webhook"]'),
                ("agent_analyst_03", "B2B Market Analyst", "Lead Researcher", "user_hemanya_admin", 25.0, 25.0, '["crustdata:enrich", "web:search"]'),
                ("agent_procure_02", "Procurement Bot", "Finance Specialist", "user_hemanya_admin", 100.0, 50.0, '["wallet:pay", "stripe:settle"]'),
                ("agent_rogue_09", "Red Team Adversary", "Security Penetration Probe", "user_hemanya_admin", 10.0, 5.0, '["test:all"]')
            ]
            now_iso = datetime.now(timezone.utc).isoformat()
            for a in default_agents:
                conn.execute(
                    "INSERT OR IGNORE INTO agents VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?);",
                    (a[0], a[1], a[2], a[3], a[4], a[5], a[6], now_iso)
                )
            conn.commit()
            cursor.execute("SELECT * FROM agents ORDER BY created_at DESC;")
            rows = cursor.fetchall()

        return [
            AgentResponse(
                agent_id=r["agent_id"],
                name=r["name"],
                role=r["role"],
                principal_id=r["principal_id"],
                max_daily_budget=r["max_daily_budget"],
                single_tx_cap=r["single_tx_cap"],
                allowed_scopes=json.loads(r["allowed_scopes"]),
                status=r["status"],
                created_at=r["created_at"]
            )
            for r in rows
        ]

@router.post("/agents/register", response_model=AgentResponse)
async def register_agent(req: AgentRegisterRequest):
    principal_id = "user_hemanya_admin"
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO agents (
                agent_id, name, role, principal_id, max_daily_budget,
                single_tx_cap, allowed_scopes, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?);
            """,
            (
                req.agent_id, req.name, req.role, principal_id,
                req.max_daily_budget, req.single_tx_cap,
                json.dumps(req.allowed_scopes), now_iso
            )
        )
        conn.commit()

    audit.record_event(
        agent_id=req.agent_id,
        action="AGENT_REGISTERED",
        status="ACTIVE",
        details={"name": req.name, "role": req.role, "scopes": req.allowed_scopes}
    )

    return AgentResponse(
        agent_id=req.agent_id,
        name=req.name,
        role=req.role,
        principal_id=principal_id,
        max_daily_budget=req.max_daily_budget,
        single_tx_cap=req.single_tx_cap,
        allowed_scopes=req.allowed_scopes,
        status="ACTIVE",
        created_at=now_iso
    )

@router.post("/agents/{agent_id}/status")
async def update_agent_status(agent_id: str, req: AgentStatusUpdateRequest):
    valid_statuses = ["ACTIVE", "SUSPENDED", "KILLED"]
    status_upper = req.status.upper()
    if status_upper not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM agents WHERE agent_id = ?;", (agent_id,))
        agent = cursor.fetchone()
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found in registry.")
        
        conn.execute("UPDATE agents SET status = ? WHERE agent_id = ?;", (status_upper, agent_id))
        conn.commit()

    policy.update_agent_status_cache(agent_id, status_upper)

    action_name = "AGENT_KILL_SWITCH_ENGAGED" if status_upper in ["SUSPENDED", "KILLED"] else "AGENT_ACTIVATED"
    audit.record_event(
        agent_id=agent_id,
        action=action_name,
        status=status_upper,
        details={"reason": req.reason, "target_agent": agent_id, "new_status": status_upper}
    )
    return {
        "success": True,
        "agent_id": agent_id,
        "status": status_upper,
        "reason": req.reason
    }

# --- POLICY EVALUATION ENGINE ---
@router.post("/policy/evaluate", response_model=ToolEvaluationResponse)
async def evaluate_tool_call(req: ToolEvaluationRequest):
    return await policy.evaluate_action(req)

# --- SANDBOXED WALLET & LEDGER ---
@router.post("/wallet/spend", response_model=SpendResponse)
async def execute_sandboxed_spend(req: SpendRequest):
    return await wallet.execute_spend(req)

@router.get("/wallet/spent/{agent_id}")
async def get_agent_spent(agent_id: str):
    return {
        "agent_id": agent_id,
        "spent_usd": wallet.get_spent(agent_id)
    }

@router.get("/wallet/transactions")
async def get_wallet_transactions(limit: int = 50):
    return wallet.get_recent_transactions(limit=limit)

# --- HUMAN APPROVALS ---
@router.get("/approvals/pending")
async def get_pending_approvals():
    return approvals.get_pending_approvals()

@router.post("/approvals/decide")
async def decide_approval(req: ApprovalDecisionRequest):
    try:
        return approvals.decide_approval(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- AUDIT LEDGER (TAMPER EVIDENT & SSE STREAM) ---
@router.get("/audit/records", response_model=List[AuditRecordResponse])
async def get_audit_records(limit: int = 50):
    return audit.get_recent_entries(limit=limit)

@router.get("/audit/verify", response_model=AuditIntegrityResponse)
async def verify_audit_ledger():
    return audit.verify_integrity()

@router.get("/audit/stream")
async def stream_audit_events():
    """
    Day 3 SSE Real-Time Event Stream:
    Streams live audit blocks and security alerts directly to browser clients.
    """
    return StreamingResponse(
        broadcaster.stream_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

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
