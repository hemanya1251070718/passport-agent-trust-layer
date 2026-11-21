import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from backend.app.core.crypto import CryptoEngine
from backend.app.core.audit import AuditLedger
from backend.app.core.db import Database
from backend.app.services.partner_integrations import CrustdataRiskAnalyzer
from backend.app.services.approval_service import ApprovalService
from backend.app.models.schemas import SpendRequest, SpendResponse

class SandboxedWallet:
    _instance = None

    def __init__(self):
        self.db = Database.get_instance()
        self.crypto = CryptoEngine.get_instance()
        self.audit = AuditLedger.get_instance()
        self.crustdata = CrustdataRiskAnalyzer()
        self.approvals = ApprovalService.get_instance()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = SandboxedWallet()
        return cls._instance

    def get_spent(self, agent_id: str) -> float:
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT COALESCE(SUM(amount), 0.0) as total FROM wallet_transactions WHERE agent_id = ? AND status = 'SETTLED';",
                (agent_id,)
            )
            return float(cursor.fetchone()["total"])

    def get_recent_transactions(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM wallet_transactions ORDER BY timestamp DESC LIMIT ?;",
                (limit,)
            )
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    async def execute_spend(self, req: SpendRequest) -> SpendResponse:
        # 1. Verify Delegation Token
        try:
            claims = self.crypto.verify_token(req.delegation_token)
        except Exception as e:
            self.audit.record_event(
                agent_id=req.agent_id,
                action="WALLET_SPEND_ATTEMPT",
                status="DENIED",
                details={"error": f"Invalid delegation token: {e}", "amount": req.amount}
            )
            return SpendResponse(
                success=False,
                remaining_budget=0.0,
                reason=f"Cryptographic token verification failed: {e}",
                audit_hash=""
            )

        # 2. Check token scope
        if "wallet:pay" not in claims.scopes and "*" not in claims.scopes:
            entry = self.audit.record_event(
                agent_id=req.agent_id,
                action="WALLET_SPEND_ATTEMPT",
                status="DENIED",
                details={"reason": "Missing 'wallet:pay' scope", "scopes": claims.scopes}
            )
            return SpendResponse(
                success=False,
                remaining_budget=claims.budget_limit - self.get_spent(req.agent_id),
                reason="Unauthorized: Agent delegation token lacks 'wallet:pay' scope",
                audit_hash=entry.entry_hash
            )

        # 3. Check Per-Transaction Limit
        if req.amount > claims.per_tx_limit:
            entry = self.audit.record_event(
                agent_id=req.agent_id,
                action="WALLET_SPEND_ATTEMPT",
                status="DENIED",
                details={
                    "reason": "Exceeded single-transaction limit",
                    "amount": req.amount,
                    "limit": claims.per_tx_limit
                }
            )
            return SpendResponse(
                success=False,
                remaining_budget=claims.budget_limit - self.get_spent(req.agent_id),
                reason=f"Transaction amount (${req.amount:.2f}) exceeds per-transaction limit (${claims.per_tx_limit:.2f})",
                audit_hash=entry.entry_hash
            )

        # 4. Check Aggregate Budget Limit
        current_spent = self.get_spent(req.agent_id)
        if current_spent + req.amount > claims.budget_limit:
            entry = self.audit.record_event(
                agent_id=req.agent_id,
                action="WALLET_SPEND_ATTEMPT",
                status="DENIED",
                details={
                    "reason": "Exceeded cumulative budget limit",
                    "amount": req.amount,
                    "current_spent": current_spent,
                    "budget_limit": claims.budget_limit
                }
            )
            return SpendResponse(
                success=False,
                remaining_budget=max(0.0, claims.budget_limit - current_spent),
                reason=f"Transaction would exceed total authorized budget (${claims.budget_limit:.2f})",
                audit_hash=entry.entry_hash
            )

        # 5. Crustdata Vendor Risk Assessment
        vendor_eval = await self.crustdata.evaluate_vendor(req.merchant_domain)
        if vendor_eval.get("risk_score", 0.0) >= 0.7:
            entry = self.audit.record_event(
                agent_id=req.agent_id,
                action="WALLET_SPEND_ATTEMPT",
                status="DENIED",
                details={
                    "reason": "High-risk unverified merchant blocked",
                    "merchant": req.merchant_domain,
                    "risk_eval": vendor_eval
                }
            )
            return SpendResponse(
                success=False,
                remaining_budget=claims.budget_limit - current_spent,
                reason=f"Merchant '{req.merchant_domain}' rejected by Crustdata risk analysis (Score: {vendor_eval.get('risk_score')})",
                audit_hash=entry.entry_hash
            )

        # 6. Execute Approved Sandboxed Spend
        tx_id = f"tx_sim_{uuid.uuid4().hex[:12]}"
        new_spent = current_spent + req.amount
        remaining = claims.budget_limit - new_spent

        entry = self.audit.record_event(
            agent_id=req.agent_id,
            action="WALLET_SPEND_SUCCESS",
            status="ALLOWED",
            details={
                "transaction_id": tx_id,
                "amount": req.amount,
                "merchant": req.merchant_domain,
                "purpose": req.purpose,
                "remaining_budget": remaining,
                "vendor_verified": vendor_eval.get("verified", False)
            }
        )

        # Persist transaction in database
        with self.db.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO wallet_transactions (
                    id, agent_id, delegation_jti, merchant, purpose, amount, status, block_index, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, 'SETTLED', ?, ?);
                """,
                (
                    tx_id, req.agent_id, claims.jti, req.merchant_domain, req.purpose,
                    req.amount, entry.index, datetime.now(timezone.utc).isoformat()
                )
            )
            conn.commit()

        return SpendResponse(
            success=True,
            transaction_id=tx_id,
            remaining_budget=remaining,
            reason="Transaction approved and settled in persistent ledger",
            audit_hash=entry.entry_hash
        )
