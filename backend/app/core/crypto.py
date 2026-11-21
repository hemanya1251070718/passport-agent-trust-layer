import os
import time
import uuid
import json
import base64
import logging
from typing import Set, Tuple, Optional, List
from datetime import datetime, timezone
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
from backend.app.models.schemas import TokenClaims
from backend.app.core.db import Database

logger = logging.getLogger("passport.crypto")

class CryptoEngine:
    _instance = None

    def __init__(self):
        self.db = Database.get_instance()
        self._init_keypair()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = CryptoEngine()
        return cls._instance

    def _init_keypair(self):
        """Loads persistent Ed25519 keypair from SQLite database or generates and persists a new one."""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT kid, private_key_raw, public_key_raw FROM system_keys WHERE kid = 'passport-ed25519-v1';")
            row = cursor.fetchone()
            if row:
                priv_bytes = base64.b64decode(row["private_key_raw"])
                self._private_key = ed25519.Ed25519PrivateKey.from_private_bytes(priv_bytes)
                self._public_key = self._private_key.public_key()
                logger.info("Loaded persistent Ed25519 keypair from database.")
            else:
                self._private_key = ed25519.Ed25519PrivateKey.generate()
                self._public_key = self._private_key.public_key()
                priv_bytes = self._private_key.private_bytes(
                    encoding=serialization.Encoding.Raw,
                    format=serialization.PrivateFormat.Raw,
                    encryption_algorithm=serialization.NoEncryption()
                )
                pub_bytes = self._public_key.public_bytes(
                    encoding=serialization.Encoding.Raw,
                    format=serialization.PublicFormat.Raw
                )
                cursor.execute(
                    "INSERT INTO system_keys (kid, private_key_raw, public_key_raw, created_at) VALUES (?, ?, ?, ?);",
                    (
                        "passport-ed25519-v1",
                        base64.b64encode(priv_bytes).decode("utf-8"),
                        base64.b64encode(pub_bytes).decode("utf-8"),
                        datetime.now(timezone.utc).isoformat()
                    )
                )
                conn.commit()
                logger.info("Generated and saved new persistent Ed25519 keypair.")

    def get_public_key_bytes(self) -> bytes:
        return self._public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )

    def get_public_key_b64(self) -> str:
        return base64.urlsafe_b64encode(self.get_public_key_bytes()).decode("utf-8").rstrip("=")

    def get_jwks(self) -> dict:
        return {
            "keys": [
                {
                    "kty": "OKP",
                    "crv": "Ed25519",
                    "x": self.get_public_key_b64(),
                    "use": "sig",
                    "kid": "passport-ed25519-v1"
                }
            ]
        }

    def mint_token(
        self,
        principal_id: str,
        agent_id: str,
        scopes: list,
        budget_limit: float = 25.0,
        per_tx_limit: float = 10.0,
        allowed_merchants: list = None,
        expires_in_seconds: int = 3600
    ) -> Tuple[str, str, int]:
        jti = str(uuid.uuid4())
        now = int(time.time())
        exp = now + expires_in_seconds
        
        claims = {
            "jti": jti,
            "parent_jti": None,
            "iss": "passport-trust-gateway",
            "sub": principal_id,
            "agent_id": agent_id,
            "scopes": scopes,
            "budget_limit": float(budget_limit),
            "per_tx_limit": float(per_tx_limit),
            "allowed_merchants": allowed_merchants or ["*"],
            "iat": now,
            "exp": exp
        }
        
        payload_bytes = json.dumps(claims, sort_keys=True).encode("utf-8")
        payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("utf-8").rstrip("=")
        
        signature = self._private_key.sign(payload_bytes)
        sig_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
        
        token_str = f"pst_{payload_b64}.{sig_b64}"

        # Persist in Database
        with self.db.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO delegations (
                    jti, parent_jti, principal_id, agent_id, token_str, scopes_json,
                    budget_limit, per_tx_limit, allowed_merchants_json, iat, exp, is_revoked, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?);
                """,
                (
                    jti, None, principal_id, agent_id, token_str, json.dumps(scopes),
                    budget_limit, per_tx_limit, json.dumps(allowed_merchants or ["*"]),
                    now, exp, datetime.now(timezone.utc).isoformat()
                )
            )
            conn.commit()

        return token_str, jti, exp

    def mint_sub_delegation(
        self,
        parent_token_str: str,
        sub_agent_id: str,
        scopes: list,
        budget_limit: float = 5.0,
        per_tx_limit: float = 5.0,
        allowed_merchants: list = None,
        expires_in_seconds: int = 1800
    ) -> Tuple[str, str, str, int]:
        """
        Mints a cryptographic sub-delegation token with strict capability attenuation.
        Enforces:
        1. Child scopes must be a subset of parent scopes.
        2. Child budget <= parent remaining budget.
        3. Child per_tx_limit <= parent per_tx_limit.
        4. Child expiration <= parent expiration.
        """
        parent_claims = self.verify_token(parent_token_str)

        # 1. Attenuation: Scope containment
        parent_scopes_set = set(parent_claims.scopes)
        for s in scopes:
            if s not in parent_scopes_set:
                raise ValueError(f"Scope attenuation violation: requested '{s}' not granted to parent delegation")

        # 2. Attenuation: Budget limit
        if budget_limit > parent_claims.budget_limit:
            raise ValueError(f"Budget attenuation violation: child budget (${budget_limit:.2f}) exceeds parent (${parent_claims.budget_limit:.2f})")

        # 3. Attenuation: Single-tx limit
        if per_tx_limit > parent_claims.per_tx_limit:
            raise ValueError(f"Transaction limit violation: child per-tx cap (${per_tx_limit:.2f}) exceeds parent (${parent_claims.per_tx_limit:.2f})")

        # 4. Attenuation: Lifetime
        now = int(time.time())
        exp = now + expires_in_seconds
        if exp > parent_claims.exp:
            exp = parent_claims.exp  # Cap at parent's expiration

        jti = str(uuid.uuid4())
        claims = {
            "jti": jti,
            "parent_jti": parent_claims.jti,
            "iss": "passport-trust-gateway",
            "sub": parent_claims.agent_id,
            "agent_id": sub_agent_id,
            "scopes": scopes,
            "budget_limit": float(budget_limit),
            "per_tx_limit": float(per_tx_limit),
            "allowed_merchants": allowed_merchants or parent_claims.allowed_merchants,
            "iat": now,
            "exp": exp
        }

        payload_bytes = json.dumps(claims, sort_keys=True).encode("utf-8")
        payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("utf-8").rstrip("=")
        
        signature = self._private_key.sign(payload_bytes)
        sig_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
        
        token_str = f"pst_{payload_b64}.{sig_b64}"

        # Persist child delegation in DB
        with self.db.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO delegations (
                    jti, parent_jti, principal_id, agent_id, token_str, scopes_json,
                    budget_limit, per_tx_limit, allowed_merchants_json, iat, exp, is_revoked, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?);
                """,
                (
                    jti, parent_claims.jti, parent_claims.sub, sub_agent_id, token_str, json.dumps(scopes),
                    budget_limit, per_tx_limit, json.dumps(allowed_merchants or parent_claims.allowed_merchants),
                    now, exp, datetime.now(timezone.utc).isoformat()
                )
            )
            conn.commit()

        return token_str, jti, parent_claims.jti, exp

    def verify_token(self, token_str: str) -> TokenClaims:
        if not token_str or not token_str.startswith("pst_"):
            raise ValueError("Malformed token prefix (must start with 'pst_')")
        
        raw = token_str[4:]
        parts = raw.split(".")
        if len(parts) != 2:
            raise ValueError("Invalid token structure (expected payload.signature)")
        
        payload_b64, sig_b64 = parts
        
        def b64_decode_padded(s: str) -> bytes:
            rem = len(s) % 4
            if rem > 0:
                s += "=" * (4 - rem)
            return base64.urlsafe_b64decode(s)
            
        try:
            payload_bytes = b64_decode_padded(payload_b64)
            sig_bytes = b64_decode_padded(sig_b64)
        except Exception as e:
            raise ValueError(f"Base64 decoding failed: {e}")
            
        try:
            self._public_key.verify(sig_bytes, payload_bytes)
        except Exception:
            raise ValueError("Cryptographic signature verification failed (forged token)")
            
        claims_dict = json.loads(payload_bytes.decode("utf-8"))
        claims = TokenClaims(**claims_dict)
        
        # Check revocation in database (including parent chain)
        if self._is_chain_revoked(claims.jti):
            raise ValueError(f"Delegation token {claims.jti} has been revoked (or an ancestor in its delegation tree)")
            
        now = int(time.time())
        if now > claims.exp:
            raise ValueError(f"Delegation token expired at {claims.exp} (current time {now})")
            
        return claims

    def _is_chain_revoked(self, jti: str) -> bool:
        """Recursively inspects delegation chain to ensure no ancestor is revoked."""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            curr_jti = jti
            while curr_jti:
                cursor.execute("SELECT parent_jti, is_revoked FROM delegations WHERE jti = ?;", (curr_jti,))
                row = cursor.fetchone()
                if not row:
                    break
                if row["is_revoked"] == 1:
                    return True
                curr_jti = row["parent_jti"]
        return False

    def revoke_token(self, jti: str, reason: str = "Revoked by principal") -> bool:
        with self.db.get_connection() as conn:
            conn.execute(
                "UPDATE delegations SET is_revoked = 1, revoked_reason = ? WHERE jti = ?;",
                (reason, jti)
            )
            conn.commit()
        return True

    def is_revoked(self, jti: str) -> bool:
        return self._is_chain_revoked(jti)
