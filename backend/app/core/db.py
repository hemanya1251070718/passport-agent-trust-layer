import os
import sqlite3
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

logger = logging.getLogger("passport.db")

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
DB_PATH = os.path.join(DB_DIR, "passport.db")

class Database:
    _instance = None

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = Database()
        return cls._instance

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        # Enable WAL mode and NORMAL synchronous for high-concurrency sub-millisecond writes
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA busy_timeout=10000;")
        conn.execute("PRAGMA foreign_keys=ON;")
        return conn

    def _init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # 1. System Keys (Ed25519 persistence)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS system_keys (
                    kid TEXT PRIMARY KEY,
                    private_key_raw TEXT NOT NULL,
                    public_key_raw TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
            """)

            # 2. Registered Agents
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS agents (
                    agent_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL,
                    principal_id TEXT NOT NULL,
                    max_daily_budget REAL NOT NULL DEFAULT 50.0,
                    single_tx_cap REAL NOT NULL DEFAULT 15.0,
                    allowed_scopes TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'ACTIVE',
                    created_at TEXT NOT NULL
                );
            """)

            # 3. Delegation Tokens & Sub-Delegation Chains
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS delegations (
                    jti TEXT PRIMARY KEY,
                    parent_jti TEXT,
                    principal_id TEXT NOT NULL,
                    agent_id TEXT NOT NULL,
                    token_str TEXT NOT NULL,
                    scopes_json TEXT NOT NULL,
                    budget_limit REAL NOT NULL,
                    per_tx_limit REAL NOT NULL,
                    allowed_merchants_json TEXT NOT NULL,
                    iat INTEGER NOT NULL,
                    exp INTEGER NOT NULL,
                    is_revoked INTEGER NOT NULL DEFAULT 0,
                    revoked_reason TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(parent_jti) REFERENCES delegations(jti)
                );
            """)

            # 4. Cryptographic Audit Ledger (SHA-256 Chained Blocks)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_ledger (
                    block_index INTEGER PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    agent_id TEXT NOT NULL,
                    action TEXT NOT NULL,
                    status TEXT NOT NULL,
                    payload_hash TEXT NOT NULL,
                    prev_hash TEXT NOT NULL,
                    entry_hash TEXT NOT NULL UNIQUE,
                    details_json TEXT NOT NULL
                );
            """)

            # 5. Sandboxed Wallet Transactions
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS wallet_transactions (
                    id TEXT PRIMARY KEY,
                    agent_id TEXT NOT NULL,
                    delegation_jti TEXT,
                    merchant TEXT NOT NULL,
                    purpose TEXT NOT NULL,
                    amount REAL NOT NULL,
                    status TEXT NOT NULL,
                    block_index INTEGER,
                    timestamp TEXT NOT NULL
                );
            """)

            # 6. Human Approval Tickets
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS approvals (
                    id TEXT PRIMARY KEY,
                    agent_id TEXT NOT NULL,
                    action_type TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'PENDING',
                    created_at TEXT NOT NULL,
                    resolved_at TEXT,
                    resolved_by TEXT
                );
            """)
            
            conn.commit()
            logger.info("Passport database schema initialized at %s", self.db_path)
