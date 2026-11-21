# Passport: The Agent Trust & Control Layer

**Okta + Stripe Limits + Flight Recorder, for Autonomous AI Agents.**

[![Security & Secret Scan](https://github.com/hemanya1251070718/passport-agent-trust-layer/actions/workflows/security.yml/badge.svg)](https://github.com/hemanya1251070718/passport-agent-trust-layer/actions)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)](https://nextjs.org)
[![Adversarial Benchmark](https://img.shields.io/badge/Red--Team%20Block%20Rate-100.0%25-brightgreen)](file:///d:/VIT%20PUNE/HACKATHONS/homingo/redteam/trust_report.json)

> **Homingo Hack Days (Edition 01)** • **Track: Agents**  
> **Problem Statement A1: Software built for agents**  
> *The internet was built for people. AI agents have no safe way to prove who they act for, no safe payment rails, and no revocable memory. Passport provides deterministic trust, delegation, policy enforcement, and a cryptographic flight recorder for autonomous agents.*

---

## ⚡ Key Highlights & Benchmark Proof

| Metric | Without Passport (Baseline) | With Passport (Governed) | Impact & Guarantee |
| :--- | :---: | :---: | :--- |
| **Attack Success Rate (ASR)** | **100.0%** (Vulnerable) | **0.0%** | **49 of 49** hostile attack vectors neutralized |
| **Attack Block Rate** | **0.0%** | **100.0%** | Deterministic default-deny interceptor |
| **False Positive Rate (FPR)** | 0.0% | **0.0%** | **11 of 11** legitimate errands allowed |
| **Decision Latency (p50)** | N/A | **0.102 ms** | Sub-millisecond cryptographic evaluation |
| **Flight Recorder Chain** | None | **SHA-256 Chained** | Mathematically tamper-evident audit ledger |

---

## 🏗 System Architecture

```
[ Human Principal / Dashboard ]
              │ (Issues Ed25519 Signed Delegation Pass)
              ▼
[ Autonomous Agent (Gemini / ADK) ]
              │
              │ (Presents Tool Call Request + Token)
              ▼
┌─────────────────────────────────────────────────────────────┐
│                 PASSPORT TRUST GATEWAY                      │
│                                                             │
│  1. Cryptographic Token Verification (Ed25519 / PubKey)    │
│  2. Default-Deny Scope Engine (web:search, wallet:pay)      │
│  3. Hostile Parameter & Prompt-Injection Filter            │
│  4. Firmographic Vendor Intelligence (Crustdata API)        │
│  5. Sandboxed Financial Wallet & Velocity Limiter          │
│  6. Human-In-The-Loop Approval Gates (Bitsbee Ops / n8n)   │
│  7. Tamper-Evident SHA-256 Chained Flight Recorder          │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [ Approved Tool Execution ]            [ Intercepted & Blocked ]
     - Governed Olostep Scraper             - Prompt Injections
     - Sandboxed Ledger Settlement          - SSRF & Metadata Probes
     - Claim Submission                     - Scope Escalations
```

---

## 🚀 Quickstart: Run in 60 Seconds

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Clone & Set Up Environment
```bash
git clone https://github.com/hemanya1251070718/passport-agent-trust-layer.git
cd passport-agent-trust-layer
cp .env.example .env
```

### 2. Run the Automated Test Suite (15/15 Tests Passing)
```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend/requirements.txt
pytest backend/tests -v
```

### 3. Run the 60-Scenario Adversarial Red-Team Benchmark
```bash
python redteam/runner.py
```

### 4. Execute the Flagship Governed Errand Demo
```bash
python demo/errand_agent.py
```

---

## 📦 5-Line Python SDK Integration

Any Python agent (LangChain, LlamaIndex, Google ADK, CrewAI, AutoGen) can be secured with Passport in 5 lines of code:

```python
from sdk.passport_agent import PassportGuard

# 1. Initialize guard with agent token
guard = PassportGuard(
    agent_id="agent-researcher",
    delegation_token="pst_eyJhZ2VudF9pZCI...",
    gateway_url="http://localhost:8000"
)

# 2. Governed execution (blocks prompt injections & unauthorized spend)
result = await guard.execute_tool(
    tool_name="olostep_scrape",
    parameters={"url": "https://example.com/refund"},
    prompt_context="System: Research refund terms"
)
```

---

## 🤝 Partner Integrations

1. **Olostep (Web Scrape & Search)**: Powers the demo agent's web research. All scraped markdown is scanned in real time for injected instructions and data exfiltration markers before passing to the LLM.
2. **Crustdata (Vendor Risk & Firmographics)**: Company-level entity verification (`POST /company/identify`) ensures agents only transact with legitimate, verified vendors.
3. **Keploy (API Test Generation)**: Automatic traffic capture and regression test generation for the FastAPI backend.
4. **n8n & Bitsbee Ops (Human Approval Channels)**: Mobile and webhook notifications for transactions exceeding the $50 automatic approval threshold.

---

## 📚 Complete Project Documentation
- **[LEARN.md](file:///d:/VIT%20PUNE/HACKATHONS/homingo/LEARN.md)**: Beginner-friendly student defense guide covering all key concepts (Ed25519, hash chains, default-deny) with anticipated judge questions.
- **[EVALUATION.md](file:///d:/VIT%20PUNE/HACKATHONS/homingo/EVALUATION.md)**: Hostile auditor review scoring all 5 judging criteria with before/after benchmarks.
- **[PROGRESS.md](file:///d:/VIT%20PUNE/HACKATHONS/homingo/PROGRESS.md)**: Real-time progress and verification record.
- **[DECISIONS.md](file:///d:/VIT%20PUNE/HACKATHONS/homingo/DECISIONS.md)**: Architectural Decision Records (ADRs).
- **[POST_DRAFT.md](file:///d:/VIT%20PUNE/HACKATHONS/homingo/POST_DRAFT.md)**: Social announcement draft for the Olostep partner prize.

---

## 🔒 Security, Compliance & License
- **Zero Real Personal Data**: Uses exclusively synthetic, simulated data.
- **Zero Secrets Committed**: Verified via Gitleaks pre-commit & GitHub Actions CI.
- **License**: [Apache 2.0](file:///d:/VIT%20PUNE/HACKATHONS/homingo/LICENSE).
