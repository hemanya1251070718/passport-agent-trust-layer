# Passport: Architecture Specification
**Track:** Agents | **Problem Statement:** A1 "Software built for agents"  
**Hackathon:** Homingo Hack Days (Edition 01)  
**Author:** Hemanya Devendra Gillurkar (`hemanya1251070718`)

---

## 1. Executive Summary

Autonomous agents operating on the modern web lack three fundamental capabilities:
1. **Verifiable Identity**: They cannot cryptographically prove who authorized them to act.
2. **Deterministic Control**: They are vulnerable to prompt injection, scope escalation, and unauthorized expenditures.
3. **Tamper-Evident Accountability**: They have no immutable flight recorder to audit their actions post-incident.

**Passport** is the zero-trust identity, policy, and execution gateway designed specifically for autonomous AI agents. It decouples agent reasoning from direct tool execution through a cryptographic proxy layer.

```
+-------------------------------------------------------------------------+
|                           AUTONOMOUS AGENT                              |
|                    (Gemini / LangChain / ADK / MCP)                     |
+-------------------------------------------------------------------------+
                                     │
                                     │ 1. Tool Call Intent + Delegation Token
                                     ▼
+-------------------------------------------------------------------------+
|                         PASSPORT TRUST GATEWAY                          |
|                       (FastAPI / Cloud Run Core)                        |
|                                                                         |
|  ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐ |
|  │  1. Crypto Engine   │  │  2. Policy Engine   │  │ 3. Sandboxed     │ |
|  │  (Ed25519 Tokens)   │──│  (Default-Deny)     │──│    Wallet        │ |
|  │  - Principal proof  │  │  - Scope validation │  │ - Per-agent cap  │ |
|  │  - Expiry & Revoke  │  │  - Threat filters   │  │ - Velocity check │ |
|  └─────────────────────┘  └─────────────────────┘  └──────────────────┘ |
|                                     │                                   |
|                                     ▼                                   |
|                          ┌──────────────────────┐                       |
|                          │ 4. Audit Ledger      │                       |
|                          │ (SHA-256 Hash Chain) │                       |
|                          └──────────────────────┘                       |
+-------------------------------------------------------------------------+
                                     │
                      ┌──────────────┴──────────────┐
                      ▼                             ▼
+-----------------------------+             +-----------------------------+
|        Olostep API          |             |        Crustdata MCP        |
|    (Web Scraping Engine)    |             |    (Firmographic Intel)     |
+-----------------------------+             +-----------------------------+
```

---

## 2. Core Architectural Components

### A. Cryptographic Identity & Delegation Engine (`CryptoEngine`)
- **Algorithm**: Ed25519 asymmetric key pairs (RFC 8032).
- **Token Format**: Standard RFC 7519 JSON Web Tokens (JWT) signed with Ed25519 (`EdDSA`).
- **Identity Hierarchy**:
  - `Principal (Human / Enterprise)`: Holds the root signing key.
  - `Agent`: Assigned an ephemeral delegation token scoped with:
    - Explicit authorized actions (`scopes`: e.g. `["web:scrape", "vendor:verify", "wallet:pay"]`).
    - Expiration timestamp (`exp`).
    - Revocation status checked against an in-memory & persisted CRL (Certificate Revocation List).
- **JWKS Endpoint**: `/api/v1/auth/jwks` allows external verifiers to independently validate agent signatures.

### B. Deterministic Policy Engine (`PolicyEngine`)
- **Zero-Trust Default-Deny**: Unless a tool and its specific parameter payload are explicitly authorized by policy rules and delegation scopes, the request is immediately rejected (`DENY`).
- **Payload Inspection**:
  - **Indirect Prompt Injection Scanner**: Evaluates web content and tool parameters against known injection vectors (e.g. `ignore previous instructions`, `transfer all funds`, `<system>`, `override`).
  - **SSRF Prevention**: Inspects outgoing URLs for AWS/GCP metadata endpoints (`169.254.169.254`, `metadata.google.internal`) and private RFC 1918 CIDR ranges (`10.0.0.0/8`, `192.168.0.0/16`, `127.0.0.1`).
  - **Privacy Guardrail**: Enforces hackathon compliance by intercepting and rejecting individual personal data searches (`crustdata_people_search`).
- **Fail-Closed Guarantee**: Any unhandled exception during policy evaluation triggers an automatic fail-closed `DENY` decision.

### C. Sandboxed Financial Wallet (`WalletService`)
- Agents are never given raw credit cards or API payment credentials.
- All expenditures are mediated through a virtual sandboxed balance:
  - Total allocated agent budget.
  - Maximum per-transaction cap.
  - Rolling velocity rate limiter (maximum transactions per time window).
  - Vetted merchant allowlist (integrated with Crustdata risk assessment).

### D. Hash-Chained Audit Ledger (`AuditLedger`)
- Every agent request, tool evaluation, security interdiction, and financial transaction creates an immutable block.
- Each block contains:
  $$\text{Block Hash} = \text{SHA256}(\text{Index} \parallel \text{Timestamp} \parallel \text{AgentID} \parallel \text{Action} \parallel \text{Status} \parallel \text{Payload} \parallel \text{PrevHash})$$
- The ledger provides a cryptographic `verify_integrity()` routine that detects any post-hoc tampering or block deletion.

### E. Human-in-the-Loop Approval & Webhook Dispatch (`ApprovalService`)
- High-risk actions (e.g. transactions exceeding normal thresholds, suspicious parameter changes) pause execution and generate an approval ticket.
- Dispatches event webhooks to **Bitsbee Ops** and **n8n** for real-time mobile/Slack approval.

---

## 3. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend API** | FastAPI / Python 3.13 | High throughput, native async, OpenAPI auto-spec, Pydantic type safety |
| **Cryptography** | `cryptography` + `PyJWT` | NIST-standard Ed25519 asymmetric cryptography |
| **Frontend UI** | Next.js 14 / TypeScript / Tailwind CSS | CrypGo Shadcn/ui glassmorphic design, reactive dashboard |
| **MCP Server** | Python MCP Protocol SDK | Seamless integration into Claude Desktop, Cursor, and Antigravity |
| **Cloud Runtime** | Google Cloud Run (Serverless) | Fast cold start, scale-to-zero (\$0 idle cost), HTTPS endpoints |
| **Partner Tools** | Olostep, Crustdata, Bitsbee, Keploy | Governed web scraping, firmographic risk vetting, operations alerts |
