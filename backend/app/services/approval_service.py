import uuid
import time
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.models.schemas import ApprovalDecisionRequest
from backend.app.core.audit import AuditLedger
from backend.app.core.db import Database

class ApprovalService:
    _instance = None

    def __init__(self):
        self.db = Database.get_instance()
        self.audit = AuditLedger.get_instance()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ApprovalService()
        return cls._instance

    def create_approval_request(
        self,
        agent_id: str,
        action: str,
        parameters: Dict[str, Any],
        risk_score: float,
        reason: str
    ) -> Dict[str, Any]:
        approval_id = f"appr_{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        
        with self.db.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO approvals (
                    id, agent_id, action_type, payload_json, reason, status, created_at
                ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?);
                """,
                (
                    approval_id, agent_id, action, json.dumps(parameters),
                    reason, now_iso
                )
            )
            conn.commit()

        self.audit.record_event(
            agent_id=agent_id,
            action=f"APPROVAL_REQUESTED_{action}",
            status="REQUIRE_APPROVAL",
            details={"approval_id": approval_id, "risk_score": risk_score, "reason": reason}
        )

        return {
            "approval_id": approval_id,
            "agent_id": agent_id,
            "action": action,
            "parameters": parameters,
            "risk_score": risk_score,
            "reason": reason,
            "status": "PENDING",
            "created_at": now_iso
        }

    def get_pending_approvals(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM approvals WHERE status = 'PENDING' ORDER BY created_at DESC;")
            rows = cursor.fetchall()
            return [
                {
                    "approval_id": r["id"],
                    "agent_id": r["agent_id"],
                    "action": r["action_type"],
                    "parameters": json.loads(r["payload_json"]),
                    "reason": r["reason"],
                    "status": r["status"],
                    "created_at": r["created_at"],
                    "decided_at": r["resolved_at"],
                    "decided_by": r["resolved_by"]
                }
                for r in rows
            ]

    def decide_approval(self, req: ApprovalDecisionRequest) -> Dict[str, Any]:
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM approvals WHERE id = ?;", (req.approval_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Approval card {req.approval_id} not found")
            if row["status"] != "PENDING":
                raise ValueError(f"Approval card {req.approval_id} has already been resolved ({row['status']})")

            now_iso = datetime.now(timezone.utc).isoformat()
            decision = req.decision.upper()

            conn.execute(
                "UPDATE approvals SET status = ?, resolved_at = ?, resolved_by = ? WHERE id = ?;",
                (decision, now_iso, req.decided_by, req.approval_id)
            )
            conn.commit()

        self.audit.record_event(
            agent_id=row["agent_id"],
            action=f"HUMAN_DECISION_{row['action_type']}",
            status=decision,
            details={
                "approval_id": req.approval_id,
                "decided_by": req.decided_by,
                "notes": req.notes
            }
        )

        return {
            "approval_id": req.approval_id,
            "agent_id": row["agent_id"],
            "action": row["action_type"],
            "status": decision,
            "decided_at": now_iso,
            "decided_by": req.decided_by,
            "notes": req.notes
        }
