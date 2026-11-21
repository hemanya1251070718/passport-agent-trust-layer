# Passport: The Agent Trust & Control Layer

**Okta + Stripe limits + a flight recorder, for AI agents.**

Passport is a deterministic trust, identity, and policy middleware for autonomous AI agents. It enables agents to act safely in the real world with revocable delegation, cryptographic verification, strict policy enforcement, sandboxed financial budgets, and a tamper-evident audit log.

Built for **Homingo Hack Days (Edition 01)** - Track: **Agents (Problem Statement A1: Software built for agents)**.

---

## Core Capabilities

1. **Agent Identity & Delegation**: Cryptographically signed delegation tokens (Ed25519/RS256) binding agent actions to human principals with fine-grained scopes and expiration.
2. **Deterministic Policy Engine**: Default-deny architecture enforcing allowlists, denylists, risk scoring, and real-time human approval gates.
3. **Sandboxed Financial Wallet**: Strict per-agent budgets, transaction caps, daily spend limits, and merchant vetting.
4. **Tamper-Evident Audit Ledger**: Cryptographic SHA-256 hash-chained flight recorder of all agent actions, tool calls, and decisions.
5. **Human Control Dashboard**: Live monitoring, policy configuration, one-click authorization cards, and emergency kill switches.
6. **Agent SDK & MCP Server**: Plug-and-play integration for Python agents and Model Context Protocol clients in under 5 lines of code.
7. **Adversarial Red-Team & Eval Suite**: 50+ scripted attack scenarios evaluating prompt injection resistance, privilege escalation, confused deputy attacks, and fail-closed security.
8. **Flagship Errand Demo**: Multi-step autonomous agent errand with simulated merchant sandbox and real-time defensive interdiction.

---

## Architecture Overview

```
[ Human Principal / Dashboard ]
             | (Issues Delegation Token)
             v
[ Autonomous Agent (Gemini / ADK) ]
             |
             | (Tool Invocation Request + Token)
             v
+-------------------------------------------------------+
|                 PASSPORT TRUST GATEWAY                |
|  - Token Verification (Ed25519 / KMS)                 |
|  - Policy Engine & Scope Check (Default Deny)         |
|  - Vendor Risk Intelligence (Crustdata)               |
|  - Sandboxed Financial Ledger & Spending Limits       |
|  - Human Approval Channel (Bitsbee Ops / n8n)         |
|  - Cryptographic Hash-Chained Audit Log               |
+-------------------------------------------------------+
             |                     |
     [ Approved Action ]    [ Denied / Flagged ]
             |                     |
             v                     v
[ Governed Tools / APIs ]    [ Interception & Security Alert ]
  (Olostep Web Scraper,
   Merchant Sandbox)
```

---

## Repository Structure

```
passport-agent-trust-layer/
├── backend/                  # FastAPI policy engine, auth, and ledger service
├── frontend/                 # Next.js / TypeScript human control dashboard
├── sdk/                      # Passport Python SDK & MCP Server
├── redteam/                  # Adversarial evaluation harness & attack vectors
├── demo/                     # Governed multi-step autonomous errand agent
├── .github/workflows/        # CI/CD, unit tests, and Gitleaks secret scanner
├── .env.example              # Environment variables template
├── .gitleaks.toml            # Secret detection rules
├── PROGRESS.md               # Real-time task progress and verification logs
├── DECISIONS.md              # Architectural decisions and trade-offs
├── JUDGING.md                # Hackathon evaluation criteria alignment
└── LEARN.md                  # Student technical defense and conceptual guide
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Cloud SDK (`gcloud`)
- Docker (optional, for containerized run)

### Local Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/hemanya1251070718/passport-agent-trust-layer.git
   cd passport-agent-trust-layer
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
3. Run the security pre-check:
   ```bash
   gitleaks detect --source . -v
   ```

---

## Partner Integrations
- **Olostep**: Governed web search and crawling tool governed by Passport security policies.
- **Crustdata**: Company-level firmographic and vendor risk scoring for financial safety.
- **Keploy**: Automated API test and mock generation from real traffic.
- **n8n**: Workflow automation for asynchronous human approval webhooks.
- **Bitsbee Ops**: Mobile and card-based human-in-the-loop approval interface.

---

## Security & Compliance
- **Zero Real Personal Data**: Strictly synthetic and simulated datasets.
- **Secret Hygiene**: Zero credentials committed; verified via CI secret scanning.
- **License**: Apache License 2.0.
