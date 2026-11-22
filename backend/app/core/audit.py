import hashlib
import json
import time
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from backend.app.models.schemas import AuditRecordResponse, AuditIntegrityResponse
from backend.app.core.db import Database
from backend.app.core.events import EventBroadcaster

logger = logging.getLogger("passport.audit")
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
        
        payload_str = json.dumps(details, sort_keys=True)
        self.payload_hash = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()
        
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

class BlockProxy:
    def __init__(self, row: dict, db):
        self.index = row["block_index"]
        self.timestamp = row["timestamp"]
        self.agent_id = row["agent_id"]
        self.action = row["action"]
        self.status = row["status"]
        self.payload_hash = row["payload_hash"]
        self.prev_hash = row["prev_hash"]
        self.entry_hash = row["entry_hash"]
        self._details = json.loads(row["details_json"])
        self._db = db

    @property
    def details(self):
        return self._details

    @details.setter
    def details(self, val: dict):
        self._details = val
        with self._db.get_connection() as conn:
            conn.execute(
                "UPDATE audit_ledger SET details_json = ? WHERE block_index = ?;",
                (json.dumps(val), self.index)
            )
            conn.commit()

class AuditLedger:
    _instance = None

    def __init__(self):
        self.db = Database.get_instance()
        self.broadcaster = EventBroadcaster.get_instance()
        self._cached_tip: Optional[AuditEntry] = None
        self._init_ledger()
        self._cached_tip = self._get_tip()

    @property
    def _chain(self) -> List[BlockProxy]:
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM audit_ledger ORDER BY block_index ASC;")
            rows = cursor.fetchall()
            return [BlockProxy(dict(r), self.db) for r in rows]

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = AuditLedger()
        return cls._instance

    def _init_ledger(self):
        """Initializes ledger from database or writes Genesis Block if empty."""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM audit_ledger;")
            count = cursor.fetchone()["count"]
            if count == 0:
                genesis = AuditEntry(
                    index=0,
                    timestamp="2026-11-21T00:00:00.000000Z",
                    agent_id="system-genesis",
                    action="GENESIS_INITIALIZE",
                    status="INITIALIZED",
                    details={"message": "Passport Agent Trust Ledger Genesis Block initialized"},
                    prev_hash=GENESIS_HASH
                )
                cursor.execute(
                    """
                    INSERT INTO audit_ledger (
                        block_index, timestamp, agent_id, action, status,
                        payload_hash, prev_hash, entry_hash, details_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                    """,
                    (
                        genesis.index, genesis.timestamp, genesis.agent_id, genesis.action,
                        genesis.status, genesis.payload_hash, genesis.prev_hash, genesis.entry_hash,
                        json.dumps(genesis.details)
                    )
                )
                conn.commit()
                logger.info("Genesis block written to persistent audit ledger.")

    def _get_tip(self) -> AuditEntry:
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM audit_ledger ORDER BY block_index DESC LIMIT 1;")
            row = cursor.fetchone()
            return AuditEntry(
                index=row["block_index"],
                timestamp=row["timestamp"],
                agent_id=row["agent_id"],
                action=row["action"],
                status=row["status"],
                details=json.loads(row["details_json"]),
                prev_hash=row["prev_hash"]
            )

    def record_event(
        self,
        agent_id: str,
        action: str,
        status: str,
        details: Dict[str, Any]
    ) -> AuditEntry:
        tip = self._cached_tip or self._get_tip()
        now_iso = datetime.now(timezone.utc).isoformat()
        
        entry = AuditEntry(
            index=tip.index + 1,
            timestamp=now_iso,
            agent_id=agent_id,
            action=action,
            status=status,
            details=details,
            prev_hash=tip.entry_hash
        )

        with self.db.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO audit_ledger (
                    block_index, timestamp, agent_id, action, status,
                    payload_hash, prev_hash, entry_hash, details_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    entry.index, entry.timestamp, entry.agent_id, entry.action,
                    entry.status, entry.payload_hash, entry.prev_hash, entry.entry_hash,
                    json.dumps(entry.details)
                )
            )
            conn.commit()

        self._cached_tip = entry

        # Real-time SSE Broadcast (fire & forget non-blocking)
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self.broadcaster.broadcast("audit_block", entry.to_dict()))
        except RuntimeError:
            pass

        return entry

    def verify_integrity(self) -> AuditIntegrityResponse:
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM audit_ledger ORDER BY block_index ASC;")
            rows = cursor.fetchall()

        if not rows:
            return AuditIntegrityResponse(
                valid=False,
                total_events=0,
                genesis_hash="",
                tip_hash="",
                broken_at_index=0
            )

        # 1. Verify Genesis
        genesis = rows[0]
        if genesis["prev_hash"] != GENESIS_HASH:
            return AuditIntegrityResponse(
                valid=False,
                total_events=len(rows),
                genesis_hash=genesis["entry_hash"],
                tip_hash=rows[-1]["entry_hash"],
                broken_at_index=0
            )

        for i in range(1, len(rows)):
            curr = rows[i]
            prev = rows[i - 1]

            # Check parent linkage
            if curr["prev_hash"] != prev["entry_hash"]:
                return AuditIntegrityResponse(
                    valid=False,
                    total_events=len(rows),
                    genesis_hash=rows[0]["entry_hash"],
                    tip_hash=rows[-1]["entry_hash"],
                    broken_at_index=i
                )

            # Check payload hash
            details = json.loads(curr["details_json"])
            expected_payload_hash = hashlib.sha256(
                json.dumps(details, sort_keys=True).encode("utf-8")
            ).hexdigest()
            if curr["payload_hash"] != expected_payload_hash:
                return AuditIntegrityResponse(
                    valid=False,
                    total_events=len(rows),
                    genesis_hash=rows[0]["entry_hash"],
                    tip_hash=rows[-1]["entry_hash"],
                    broken_at_index=i
                )

            # Check entry hash
            raw = f"{curr['prev_hash']}|{curr['block_index']}|{curr['timestamp']}|{curr['agent_id']}|{curr['action']}|{curr['status']}|{curr['payload_hash']}"
            expected_entry_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
            if curr["entry_hash"] != expected_entry_hash:
                return AuditIntegrityResponse(
                    valid=False,
                    total_events=len(rows),
                    genesis_hash=rows[0]["entry_hash"],
                    tip_hash=rows[-1]["entry_hash"],
                    broken_at_index=i
                )

        return AuditIntegrityResponse(
            valid=True,
            total_events=len(rows),
            genesis_hash=rows[0]["entry_hash"],
            tip_hash=rows[-1]["entry_hash"],
            broken_at_index=None
        )

    def get_recent_entries(self, limit: int = 50) -> List[AuditRecordResponse]:
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM audit_ledger ORDER BY block_index DESC LIMIT ?;", (limit,))
            rows = cursor.fetchall()
            return [
                AuditRecordResponse(
                    index=r["block_index"],
                    timestamp=r["timestamp"],
                    agent_id=r["agent_id"],
                    action=r["action"],
                    status=r["status"],
                    payload_hash=r["payload_hash"],
                    prev_hash=r["prev_hash"],
                    entry_hash=r["entry_hash"],
                    details=json.loads(r["details_json"])
                )
                for r in rows
            ]
