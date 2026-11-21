import uuid
import time
from typing import Dict, Any, List, Optional
from backend.app.models.schemas import ApprovalDecisionRequest
from backend.app.core.audit import AuditLedger

class HumanApprovalCard:
    def __init__(
        self,
        approval_id: str,
        agent_id: str,
        action: str,
        parameters: Dict[str, Any],
        risk_score: float,
        reason: str
    ):
        self.approval_id = approval_id
        self.agent_id = agent_id
        self.action = action
        self.parameters = parameters
        self.risk_score = risk_score
        self.reason = reason
        self.status = "PENDING"  # PENDING, APPROVED, REJECTED
        self.created_at = int(time.time())
        self.decided_at: Optional[int] = None
        self.decided_by: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "approval_id": self.approval_id,
            "agent_id": self.agent_id,
            "action": self.action,
            "parameters": self.parameters,
            "risk_score": self.risk_score,
            "reason": self.reason,
            "status": self.status,
            "created_at": self.created_at,
            "decided_at": self.decided_at,
            "decided_by": self.decided_by
        }

class ApprovalService:
    _instance = None

    def __init__(self):
        self._cards: Dict[str, HumanApprovalCard] = {}
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
    ) -> HumanApprovalCard:
        approval_id = f"appr_{uuid.uuid4().hex[:12]}"
        card = HumanApprovalCard(
            approval_id=approval_id,
            agent_id=agent_id,
            action=action,
            parameters=parameters,
            risk_score=risk_score,
            reason=reason
        )
        self._cards[approval_id] = card
        
        self.audit.record_event(
            agent_id=agent_id,
            action=f"APPROVAL_REQUESTED_{action}",
            status="REQUIRE_APPROVAL",
            details={"approval_id": approval_id, "risk_score": risk_score, "reason": reason}
        )
        return card

    def get_pending_approvals(self) -> List[Dict[str, Any]]:
        return [c.to_dict() for c in self._cards.values() if c.status == "PENDING"]

    def decide_approval(self, req: ApprovalDecisionRequest) -> Dict[str, Any]:
        card = self._cards.get(req.approval_id)
        if not card:
            raise ValueError(f"Approval card {req.approval_id} not found")
        if card.status != "PENDING":
            raise ValueError(f"Approval card {req.approval_id} has already been resolved ({card.status})")

        card.status = req.decision.upper()
        card.decided_at = int(time.time())
        card.decided_by = req.decided_by

        self.audit.record_event(
            agent_id=card.agent_id,
            action=f"HUMAN_DECISION_{card.action}",
            status=card.status,
            details={
                "approval_id": card.approval_id,
                "decided_by": req.decided_by,
                "notes": req.notes
            }
        )
        return card.to_dict()
