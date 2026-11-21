# CLAUDE INSTRUCTION & PROJECT CONTEXT BRIEFING

> **CRITICAL DIRECTIVE FOR CLAUDE:**
> The user is attaching/providing a separate file named `ui_good.md` (or pasting code from it).
> `ui_good.md` contains an exceptionally well-designed UI template (cards, layout patterns, visual polish, glow effects, micro-interactions, responsive styling, or animation structures).
>
> **YOUR TASK:**
> 1. **Read `ui_good.md` thoroughly.**
> 2. **Extract and preserve all its superior UI/UX patterns**: the visual hierarchy, card glassmorphism, glowing borders, hover micro-interactions, layout grids, badges, typography pacing, and animation choreography.
> 3. **Completely replace any unrelated or third-party domain data** found in `ui_good.md` (e.g., cryptocurrency trading, Bitcoin/Ethereum tickers, generic e-commerce, web3 tokens, or placeholder SaaS metrics) with the **authentic domain data, schemas, telemetry, and capabilities of THIS project: PASSPORT**.
> 4. Ensure the output is **production-grade Next.js 16 + React 19 + TypeScript + Tailwind CSS v4** code that can be dropped directly into the project without broken imports or missing types.
> 5. **FORMAT YOUR RESPONSE AS AN ANTIGRAVITY BUILD PROMPT**: Structure your final output as a single, comprehensive, actionable instruction prompt that the user can directly paste back into **Antigravity AI**. Include:
>    - Target file paths (`frontend/src/components/...` or `frontend/src/app/...`)
>    - Full, complete component code blocks (no `// rest of code goes here` shortcuts)
>    - Integration instructions for the target pages (`/dashboard`, `/agents`, `/policies`, `/wallet`, `/approvals`, etc.)
>    - Clear step-by-step verification checklist for Antigravity to build, commit, and deploy.
>
> Below is the complete, exhaustive specification of the **Passport** project, its architecture, data models, telemetry, card conventions, and route ecosystem.

---

## 1. Project Identity & Mission

- **Project Name**: **Passport** (Trust, Identity & Control Layer for Autonomous AI Agents)
- **Hackathon Track**: Homingo Hack Days 2026 — Track: Agents (Problem Statement A1: *"Software built for agents"*)
- **Author**: Hemanya Devendra Gillurkar (`hemanya.1251070718@vit.edu` / `hemanya1251070718`)
- **Live Deployments**:
  - **Frontend (Cloud Run)**: `https://passport-trust-frontend-58223756937.asia-south1.run.app`
  - **Backend Gateway (Cloud Run)**: `https://passport-trust-gateway-58223756937.asia-south1.run.app`
  - **GitHub Repository**: `https://github.com/hemanya1251070718/passport-agent-trust-layer`

### The Problem Passport Solves:
When autonomous AI agents operate on the web (performing research, executing tools, scraping sites, purchasing API credits, or interacting with services), giving them raw human credentials, unconstrained credit cards, or naked API keys is catastrophic. Agents are vulnerable to **indirect prompt injection**, **unauthorized scope escalation**, **budget exhaustion**, and **SSRF/metadata attacks**. Furthermore, when an incident occurs, enterprises have no verifiable, cryptographic proof of what the agent did or who authorized it.

### The Solution:
**Passport** is the zero-trust control plane that sits between autonomous AI agent swarms and external tool execution. It enforces:
1. **Cryptographic Identity Delegation**: Ephemeral Ed25519 passes (RFC 8037) with fine-grained capability scopes and expiration TTLs.
2. **Sub-Millisecond Guardrail Policies**: In-memory default-deny policy engine that inspects every tool call, blocking prompt injections, private network scans (SSRF), and unauthorized actions before they touch the wire.
3. **Sandboxed Spend Velocity Wallets**: Dual-limit treasury controls with daily caps, per-transaction thresholds, merchant category allowlists, and human-in-the-loop (HITL) approval workflows.
4. **Verifiable Audit Flight Recorder**: Immutable SHA-256 hash-chained ledger verifying every decision (`ALLOW`, `DENY`, `APPROVE_REQ`, `SETTLED`) with zero-knowledge STARK integrity proofs.

---

## 2. Technology Stack & Design System

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5 (Strict Mode).
- **Styling**: Tailwind CSS v4.0 with `@tailwindcss/postcss`.
- **Primitives**: `@base-ui/react`, Radix UI / Shadcn UI components.
- **Animation**: `framer-motion` (v12), pure HTML5 Canvas 2D glow renderers (`PeakChart`), AOS (`aos`).
- **Icons**: `lucide-react`.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, cryptography (`ed25519`), OPA/Rego in-memory evaluator, SHA-256 hash chains.

### Visual Aesthetic & Theme:
- **Background**: Deep obsidian/space dark (`#030712`, `bg-background`, `bg-zinc-950`).
- **Surface / Card Backgrounds**: Subtle glassmorphism `bg-white/[0.04]` or `bg-white/5` with thin borders `border-white/10`.
- **Accent Glows**:
  - Neon Cyan / Electric Blue: `#06b6d4` / `#0ea5e9` (`text-cyan-400`, `border-cyan-500/30`)
  - Deep Purple: `#8b5cf6` (`text-purple-400`, `border-purple-500/30`)
  - Emerald / Success: `#10b981` (`text-emerald-400`, `bg-emerald-500/10`)
  - Rose / Deny / Danger: `#f43f5e` / `#ef4444` (`text-rose-400`, `bg-rose-500/10`)
  - Amber / Warning / Approval: `#f59e0b` (`text-amber-400`, `bg-amber-500/10`)
- **Typography**:
  - Body & Headlines: `DM Sans` / system clean sans-serif.
  - Numbers, Metrics, Fingerprints, Hashes, Timestamps, and Tokens: **`font-mono`** (e.g. `ed25519:7a4f9b2c...`, `$8.50`, `0.082 ms`).

---

## 3. Core Domain Entities & Schemas

When designing cards, replace any external data from `ui_good.md` with these exact domain objects:

### Entity 1: Autonomous Agent Identity (`AgentRecord`)
```typescript
interface AgentRecord {
  id: string; // e.g. "agent_errand_01", "agent_research_04", "agent_rogue_09"
  name: string; // e.g. "Autonomous Travel & Booking Assistant", "B2B Market Enrichment Agent"
  role: "RESEARCHER" | "OPERATOR" | "TREASURY" | "SCOUT";
  status: "ACTIVE" | "REVOKED" | "STANDBY" | "EXPIRED";
  keyFingerprint: string; // e.g. "ed25519:7a4f9b2c8e1d3a5f"
  scopes: string[]; // e.g. ["olostep:scrape", "crustdata:enrich", "wallet:spend"]
  budgetLimit: number; // e.g. 50.00 (USD)
  perTxLimit: number; // e.g. 15.00 (USD)
  spentAmount: number; // e.g. 8.50 (USD)
  ttlRemaining: string; // e.g. "3,412s" or "EXPIRED"
  token: string; // RFC 8037 JWT: "eyJhbGciOiJFZERTQSI..."
}
```

### Entity 2: Policy Engine Evaluation (`PolicyRule` & `PolicyEvent`)
```typescript
interface PolicyRule {
  id: string; // e.g. "pol_anti_ssrf", "pol_prompt_injection_guard", "pol_merchant_allowlist"
  name: string; // e.g. "Cloud Metadata Egress Interceptor"
  action: "ALLOW" | "DENY" | "APPROVE_REQ";
  targetCapability: string; // e.g. "network.outbound", "llm.context_ingest", "wallet.spend"
  condition: string; // e.g. "payload.url !matches '(169.254.169.254|metadata.google.internal)'"
  blockedCount: number; // e.g. 142
  latencyAvg: string; // e.g. "0.082 ms"
  status: "ENFORCING" | "AUDITING" | "DISABLED";
}

interface PolicyDecisionEvent {
  id: string; // e.g. "evt_1048"
  timestamp: string; // e.g. "14:48:12.802"
  agentId: string; // e.g. "agent_errand_01"
  decision: "ALLOW" | "DENY" | "APPROVE_REQ" | "SETTLED";
  action: string; // e.g. "olostep.scrape", "wallet.spend", "system.exec", "network.probe"
  target: string; // e.g. "https://homingo.com", "api.olostep.com", "169.254.169.254:80"
  reason: string; // e.g. "Authorized under scope 'olostep:scrape'", "SSRF Attempt Detected"
  riskScore: number; // 0.00 to 1.00 (e.g. 0.05 vs 0.98)
}
```

### Entity 3: Sandboxed Spend Wallet & Ledger (`WalletAccount` & `Transaction`)
```typescript
interface WalletAccount {
  agentId: string;
  allocatedBudget: number; // e.g. $50.00
  spentToday: number; // e.g. $8.50
  remainingBalance: number; // e.g. $41.50
  perTxCap: number; // e.g. $15.00
  dailyVelocityCap: number; // e.g. 10 tx/hr
  currentVelocity: number; // e.g. 2 tx/hr
  vettedMerchants: string[]; // ["api.olostep.com", "api.crustdata.com", "homingo.com"]
}

interface WalletTransaction {
  id: string; // e.g. "tx_c93148f98aa3"
  timestamp: string; // e.g. "2026-11-21T14:48:14.194Z"
  agentId: string; // e.g. "agent_errand_01"
  merchant: string; // e.g. "api.olostep.com"
  purpose: string; // e.g. "Scrape batch: 400 clean markdown pages"
  amount: number; // e.g. $8.50
  status: "SETTLED" | "BLOCKED" | "PENDING_APPROVAL";
  approvalTicketId?: string | null;
}
```

### Entity 4: Immutable Flight Recorder Block (`AuditBlock`)
```typescript
interface AuditBlock {
  index: number; // e.g. 1048
  timestamp: string; // ISO 8601 UTC
  agentId: string; // e.g. "agent_errand_01"
  action: string; // e.g. "WALLET_SPEND_SETTLED", "POLICY_INTERCEPT_PROMPT_INJECTION"
  decision: "ALLOW" | "DENY" | "APPROVE_REQ";
  payloadHash: string; // SHA-256 e.g. "4f73a19e8c..."
  previousHash: string; // SHA-256 link
  blockHash: string; // SHA256(canonical_json(block) + previous_hash)
  tamperVerified: boolean; // true
}
```

### Entity 5: Human-In-The-Loop (HITL) Approval Queue (`ApprovalRequest`)
```typescript
interface ApprovalRequest {
  ticketId: string; // e.g. "appr_7829a"
  timestamp: string; // e.g. "2 minutes ago"
  agentId: string; // e.g. "agent_errand_01"
  merchant: string; // e.g. "api.olostep.com"
  requestedAmount: number; // e.g. $28.50
  thresholdCap: number; // e.g. $15.00
  reasonForHold: "EXCEEDS_PER_TX_CAP" | "HIGH_RISK_MERCHANT" | "UNFAMILIAR_SCOPE";
  proposedAction: string; // e.g. "Upgrade scrape concurrency to 50 workers"
  status: "PENDING" | "APPROVED" | "REJECTED";
}
```

---

## 4. Current Application Routes & Page Architecture

When redesigning or introducing cards from `ui_good.md`, align them with one of these application tabs:

1. **Overview & Swarm Telemetry (`/dashboard`)**:
   - Executive fleet metrics: Active Agent Passes, Threat Block Rate (98.4%), 24h Spend Velocity, Sub-millisecond Kernel Latency (`0.082 ms`).
   - Dynamic charts (`PeakChart` dual-wave visualizer for policy pass vs block rate).
   - Real-time decision stream table/cards.
2. **Agent Identity & Delegation (`/agents`)**:
   - Grid of Agent Pass Cards displaying Ed25519 cryptographic fingerprints, assigned scopes chips, real-time TTL countdown, and Revoke action.
   - Pass Minting modal (Input Agent ID, assign scopes like `olostep:scrape`, set max budget).
3. **Guardrail Policy Engine (`/policies`)**:
   - Zero-trust default-deny rule cards (SSRF filter, Prompt Injection heuristic, Allowed domain lists).
   - Real-time policy simulator toggle.
4. **HITL Approvals Queue (`/approvals`)**:
   - Cards showing pending high-value agent actions awaiting human cryptographic signature or click authorization.
5. **Sandboxed Treasury & Spend (`/wallet`)**:
   - Wallet card with spend progress bar (`$8.50 / $50.00`), velocity throttle gauges, recent settled transactions table, CSV ledger export.
6. **Audit Flight Recorder (`/audit`)**:
   - Chronological hash-chained blocks with live cryptographic verification badge ("Hash Chain Verified: 1,048 Blocks Intact").
7. **Trust Report & ZKP Verification (`/trust-report`)**:
   - STARK cryptographic proofs, adversarial red-team test suite results (99.2% prompt injection mitigation score).
8. **Policy Sandbox (`/sandbox`)**:
   - Interactive editor to paste agent tool call payloads and observe policy engine sub-millisecond evaluation in real-time.
9. **Interactive Swarm Demo (`/demo`)**:
   - Deterministic scenario runner comparing `agent_errand_01` (legitimate research task) vs `agent_rogue_09` (adversarial injection & exfiltration attempt).
10. **Developer Documentation (`/documentation`)**:
    - OpenAPI specs, Python SDK snippets, MCP server configuration guides.

---

## 5. What Makes a "Good Card" in Passport

When adapting cards from `ui_good.md`, ensure the card implements these conventions:

1. **Card Container**:
   ```tsx
   <div className="relative group rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-xl hover:border-primary/40 hover:bg-white/[0.05] transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
   ```
2. **Card Header**:
   - Left: Small icon wrapped in a glowing rounded square (`p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary`).
   - Center/Right: Category label in `text-xs font-mono uppercase text-muted-foreground tracking-wider` and a Status/Badge (`<Badge variant="outline">`).
3. **Card Body / Key Figures**:
   - Dominant metric rendered in **large monospace font** (`text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight`).
   - Secondary subtitle or delta trend (`+3.4%`, `0.08ms latency`, `RFC 8037`).
4. **Card Data Attributes & Chips**:
   - Scope pills (`bg-primary/10 text-cyan-400 border border-primary/20 text-[10px] font-mono px-2 py-0.5 rounded-full`).
   - Cryptographic fingerprint with copy button (`ed25519:7a4f...8e1d`).
   - Micro progress bars (`w-full bg-white/10 rounded-full h-1.5 overflow-hidden`).
5. **Interactive Controls**:
   - Sub-action buttons (View Details, Revoke, Re-evaluate, Approve, Export) styled with subtle ghost borders or gradient pills (`from-cyan-500 to-purple-600`).

---

## 6. Claude Execution Checklist

When you process `ui_good.md`, verify the following before outputting your solution:

- [ ] **Zero Unrelated Keywords**: No Bitcoin, Ethereum, crypto token swaps, DeFi APY, generic e-commerce checkout, or unrelated SaaS metrics remain.
- [ ] **100% Passport Grounding**: All cards reflect agent identity, Ed25519 delegation, policy guardrails, spend velocity, or audit flight recorder telemetry.
- [ ] **Preserved Visual Brilliance**: All the beautiful layouts, gradients, animations, glassmorphism, and responsive spacing from `ui_good.md` are completely preserved or elevated.
- [ ] **TypeScript Strictness**: All props and state interfaces are strictly typed (`interface ...`, `FC<...>`, no untyped `any`).
- [ ] **Ready to Run**: Code can be copied and pasted directly into the Next.js project with standard icons from `lucide-react` and existing UI components.
