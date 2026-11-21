import hashlib
import json
import time
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from backend.app.models.schemas import AuditRecordResponse, AuditIntegrityResponse

GENESIS_HASH = "0" * 64

class AuditEntry:
    def __init__(
        self,
        index: int,
        timestamp: str,
        agent_id: str,
        action: str,
        status: str,
        details: Dict[str, Any],
        prev_hash: str
    ):
        self.index = index
        self.timestamp = timestamp
        self.agent_id = agent_id
        self.action = action
        self.status = status
        self.details = details
        self.prev_hash = prev_hash
        
        # Calculate canonical payload hash
        payload_str = json.dumps(details, sort_keys=True)
        self.payload_hash = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()
        
        # Calculate block entry hash
        raw_block = f"{prev_hash}|{index}|{timestamp}|{agent_id}|{action}|{status}|{self.payload_hash}"
        self.entry_hash = hashlib.sha256(raw_block.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "agent_id": self.agent_id,
            "action": self.action,
            "status": self.status,
            "payload_hash": self.payload_hash,
            "prev_hash": self.prev_hash,
            "entry_hash": self.entry_hash,
            "details": self.details
        }

class AuditLedger:
    _instance = None

    def __init__(self):
        self._chain: List[AuditEntry] = []
        # Seed Genesis Block
        genesis = AuditEntry(
            index=0,
            timestamp="2026-11-21T00:00:00.000000Z",
            agent_id="system-genesis",
            action="GENESIS_INITIALIZE",
            status="INITIALIZED",
            details={"message": "Passport Agent Trust Ledger Genesis Block initialized"},
            prev_hash=GENESIS_HASH
        )
        self._chain.append(genesis)

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = AuditLedger()
        return cls._instance

    def record_event(
        self,
        agent_id: str,
        action: str,
        status: str,
        details: Dict[str, Any]
    ) -> AuditEntry:
        prev = self._chain[-1]
        now_iso = datetime.now(timezone.utc).isoformat()
        
        entry = AuditEntry(
            index=len(self._chain),
            timestamp=now_iso,
            agent_id=agent_id,
            action=action,
            status=status,
            details=details,
            prev_hash=prev.entry_hash
        )
        self._chain.append(entry)
        return entry

    def verify_integrity(self) -> AuditIntegrityResponse:
        if not self._chain:
            return AuditIntegrityResponse(
                valid=False,
                total_events=0,
                genesis_hash="",
                tip_hash="",
                broken_at_index=0
            )

        # Verify Genesis
        if self._chain[0].prev_hash != GENESIS_HASH:
            return AuditIntegrityResponse(
                valid=False,
                total_events=len(self._chain),
                genesis_hash=self._chain[0].entry_hash,
                tip_hash=self._chain[-1].entry_hash,
                broken_at_index=0
            )

        for i in range(1, len(self._chain)):
            curr = self._chain[i]
            prev = self._chain[i - 1]

            # 1. Check parent linkage
            if curr.prev_hash != prev.entry_hash:
                return AuditIntegrityResponse(
                    valid=False,
                    total_events=len(self._chain),
                    genesis_hash=self._chain[0].entry_hash,
                    tip_hash=self._chain[-1].entry_hash,
                    broken_at_index=i
                )

            # 2. Check payload hash
            expected_payload_hash = hashlib.sha256(
                json.dumps(curr.details, sort_keys=True).encode("utf-8")
            ).hexdigest()
            if curr.payload_hash != expected_payload_hash:
                return AuditIntegrityResponse(
                    valid=False,
                    total_events=len(self._chain),
                    genesis_hash=self._chain[0].entry_hash,
                    tip_hash=self._chain[-1].entry_hash,
                    broken_at_index=i
                )

            # 3. Check entry hash
            raw = f"{curr.prev_hash}|{curr.index}|{curr.timestamp}|{curr.agent_id}|{curr.action}|{curr.status}|{curr.payload_hash}"
            expected_entry_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
            if curr.entry_hash != expected_entry_hash:
                return AuditIntegrityResponse(
                    valid=False,
                    total_events=len(self._chain),
                    genesis_hash=self._chain[0].entry_hash,
                    tip_hash=self._chain[-1].entry_hash,
                    broken_at_index=i
                )

        return AuditIntegrityResponse(
            valid=True,
            total_events=len(self._chain),
            genesis_hash=self._chain[0].entry_hash,
            tip_hash=self._chain[-1].entry_hash,
            broken_at_index=None
        )

    def get_recent_entries(self, limit: int = 50) -> List[AuditRecordResponse]:
        entries = self._chain[-limit:]
        return [AuditRecordResponse(**e.to_dict()) for e in reversed(entries)]
