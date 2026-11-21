import os
import time
import uuid
import json
import base64
from typing import Set, Tuple, Optional
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
from backend.app.models.schemas import TokenClaims

class CryptoEngine:
    _instance = None

    def __init__(self):
        # Generate persistent or session Ed25519 keypair
        self._private_key = ed25519.Ed25519PrivateKey.generate()
        self._public_key = self._private_key.public_key()
        self._revoked_tokens: Set[str] = set()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = CryptoEngine()
        return cls._instance

    def get_public_key_bytes(self) -> bytes:
        return self._public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )

    def get_public_key_b64(self) -> str:
        return base64.urlsafe_b64encode(self.get_public_key_bytes()).decode("utf-8").rstrip("=")

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
        
        # Canonical JSON encoding for deterministic signature
        payload_bytes = json.dumps(claims, sort_keys=True).encode("utf-8")
        payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("utf-8").rstrip("=")
        
        # Sign payload with Ed25519
        signature = self._private_key.sign(payload_bytes)
        sig_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
        
        token_str = f"pst_{payload_b64}.{sig_b64}"
        return token_str, jti, exp

    def verify_token(self, token_str: str) -> TokenClaims:
        if not token_str or not token_str.startswith("pst_"):
            raise ValueError("Malformed token prefix (must start with 'pst_')")
        
        raw = token_str[4:]
        parts = raw.split(".")
        if len(parts) != 2:
            raise ValueError("Invalid token structure (expected payload.signature)")
        
        payload_b64, sig_b64 = parts
        
        # Base64 decode with proper padding
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
            
        # Cryptographic verification
        try:
            self._public_key.verify(sig_bytes, payload_bytes)
        except Exception:
            raise ValueError("Cryptographic signature verification failed (forged token)")
            
        # Parse claims
        claims_dict = json.loads(payload_bytes.decode("utf-8"))
        claims = TokenClaims(**claims_dict)
        
        # Check revocation
        if claims.jti in self._revoked_tokens:
            raise ValueError(f"Delegation token {claims.jti} has been revoked by principal")
            
        # Check expiration
        now = int(time.time())
        if now > claims.exp:
            raise ValueError(f"Delegation token expired at {claims.exp} (current time {now})")
            
        return claims

    def revoke_token(self, jti: str) -> bool:
        self._revoked_tokens.add(jti)
        return True

    def is_revoked(self, jti: str) -> bool:
        return jti in self._revoked_tokens
