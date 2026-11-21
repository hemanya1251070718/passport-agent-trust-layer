# Architecture Decision Records (ADRs)

## ADR 001: Cryptographic Delegation Token Standard
- **Context**: Autonomous agents require verifiable, time-bound authority to act on behalf of a human principal without exposing the human's root credentials.
- **Decision**: Adopt Ed25519 signed JWTs (JSON Web Tokens) with custom claims (`principal_id`, `agent_id`, `scopes`, `budget_limit`, `exp`, `jti`).
- **Rationale**: Ed25519 provides ultra-fast signature verification (<1ms) and compact keys compared to RSA, suitable for high-frequency agent tool calls.

## ADR 002: Default-Deny Policy Engine
- **Context**: Autonomous agents generating dynamic tool calls can be coerced via prompt injection to access unauthorized tools or endpoints.
- **Decision**: Enforce a deterministic default-deny policy evaluation gate. Any tool call not explicitly permitted in the active delegation scope or exceeding transaction risk thresholds is rejected or escalated to human approval.

## ADR 003: SHA-256 Hash-Chained Audit Ledger
- **Context**: Post-incident forensic audit requires proof that audit records have not been altered or deleted by a compromised agent or insider.
- **Decision**: Structure audit log entries as a cryptographic hash chain: `hash_n = SHA256(hash_{n-1} + timestamp + event_payload)`.
- **Rationale**: Provides tamper-evident verification with minimal computational overhead.
