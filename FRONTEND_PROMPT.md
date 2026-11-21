═══════════════════════════════════════════════
FRONTEND BRIEF: CLONE CRYPGO, REBUILD AS PASSPORT
═══════════════════════════════════════════════
You are Tony Stark, builder. This brief extends BUILD_PROMPT.md; all its rules still apply (GitHub workflow with issues/branches/PRs and small honest commits, no secrets in the public repo, synthetic data only, LEARN.md updates, no dishonest activity).

COPYRIGHT-FILTER SAFETY: NEVER retype or regenerate the template's code, its license text, or any long boilerplate from memory. Obtain everything with git/CLI commands only. If any output gets blocked, don't retry it identically: split it into smaller pieces or use a CLI instead, and tell me.

─── STEP 1: CLONE THE EXACT TEMPLATE ───
Template: Crypgo by ShadcnSpace (MIT license), Next.js + Tailwind CSS v4 + shadcn/ui.
1. Outside our repo (e.g. a temp folder), run:
   git clone https://github.com/shadcnspace/crypgo-shadcn-ui-landingpage.git
2. Try to pin to commit e4c1e4e (git checkout e4c1e4e). If that commit doesn't exist, stay on the default branch and record the exact commit hash you used.
3. Inspect the repo structure first (it has a nextjs/ folder and an astro/ folder). Use ONLY the nextjs/ version. Report what you find: Node version needed, package manager and lockfile, Next.js/React/Tailwind versions, list of pages/routes (landing, sign-in, sign-up, documentation), and the component folders.
4. Copy the nextjs/ folder contents into /frontend in OUR repo. Do NOT copy the template's .git folder, the astro/ folder or any Figma files. Keep the template's LICENSE file (copied with cp, not retyped) at /frontend/LICENSE-crypgo.
5. Install dependencies with the template's own package manager and lockfile. Run the dev server and the production build. Both must pass before you change anything. Screenshot the running template (home, sign-in, sign-up, documentation) as the "before" baseline.
6. Commit as: chore(frontend): import Crypgo template (MIT) at <commit hash>. Record the source URL, commit hash and license in DECISIONS.md and in the README credits section.

─── STEP 2: KEEP THE LOOK, REPLACE THE CONTENT ───
Preserve EXACTLY: the layout, spacing, typography, color tokens, shadcn components, dark/light theming, section structure, animations and responsive behavior. Do not redesign it.
Replace ALL crypto/placeholder content with real Passport content:
- Branding: new logo (simple SVG you create), name "Passport", favicon, page titles, meta tags, Open Graph tags. Remove the template's logos, brand/partner logos and social placeholder links that are not ours.
- Hero: "Trust layer for AI agents" style headline, subtext, CTAs ("Open dashboard", "Read the docs").
- The scrolling coin ticker becomes a LIVE feed of real events from our backend (agent action allowed / blocked / approval requested), with a clearly labelled simulated-demo mode if there is no live traffic.
- The "0M+ users / countries / trade volume" stat counters become REAL metrics from the API (agents registered, actions evaluated, attacks blocked, p95 decision latency). No invented numbers anywhere. No fake testimonials, fake customer logos or fake claims.
- Features / timeline / roadmap sections: explain identity, delegation, permissions, wallet limits, audit log, sandbox + red-team evals, SDK/MCP, using our real feature set.
- FAQ: real answers about how Passport works and what is simulated vs real.
- Documentation page: real developer docs (quickstart, SDK, MCP server, API reference, policy examples), rendered from markdown in the repo.
- Footer: real links only (GitHub repo, docs, license/credits). Remove dead "#" links and the app-store badges.
- Delete every unused template asset, image and component after the swap. Run a repo-wide search for the strings: crypto, coin, bitcoin, BTC, Crypgo, Coinbase, OKEx, framer, exchange, trade, and make sure none remain except in the credits section.

─── STEP 3: BUILD THE REAL PRODUCT PAGES IN THE SAME DESIGN SYSTEM ───
Using only the template's existing shadcn components, tokens and patterns (add more shadcn components via the shadcn CLI, never by retyping them), build:
- /sign-in, /sign-up (reuse the template screens) wired to REAL Firebase Auth (email/password + Google sign-in), with session handling, protected routes via middleware, and logout.
- /dashboard (overview: agents, spend, pending approvals, recent activity, live attack-blocked counter)
- /agents (register, view identity + delegation, scopes, revoke, KILL SWITCH)
- /policies (visual policy editor: allow/deny/require-approval rules, limits, merchant allowlist, with validation and a "test this policy" simulator)
- /approvals (real-time queue, approve/deny with reason, risk score explanation)
- /wallet (balances, limits, ledger table, filters, export), labelled sandbox/simulated
- /audit (hash-chained timeline, verify-chain button, export)
- /memory (vault viewer with forget controls, if built)
- /trust-report (red-team results: with vs without Passport, attack success rate, block rate, false positives, p50/p95 latency, charts)
- /sandbox (run scripted attacks and the demo agent, watch live)
- /docs (developer documentation)
- /demo (one-click deterministic demo mode for the judges)
Every page needs real loading, empty, error and unauthorized states, keyboard accessibility, responsive layout (mobile checked), and consistent dark/light mode.

─── STEP 4: FRONTEND ↔ BACKEND INTEGRATION ───
- Typed API client in /frontend/lib/api (generate types from the backend's OpenAPI schema where possible; one module per resource; central error handling; retries only for safe GETs; request timeouts).
- Auth: the frontend gets the Firebase ID token and sends it as a Bearer token; the FastAPI backend verifies it on every request. Role-based access (owner/admin/viewer). Never trust the client.
- Real-time: use Server-Sent Events or WebSockets (or Firestore listeners if that is our DB) for approvals queue and live activity feed; handle reconnects.
- Config: all URLs/keys via environment variables. Only NEXT_PUBLIC_ values are public (Firebase web config is fine to expose; the backend's secrets and partner API keys NEVER reach the frontend). Provide .env.example for frontend and backend with every variable documented.
- CORS configured explicitly for known origins only; CSRF-safe design; security headers (CSP, HSTS, frame-ancestors, referrer policy) set in Next.js config; no dangerouslySetInnerHTML with untrusted content; sanitize any markdown rendered in docs.
- Next.js route handlers must NOT be used as a place to hide business logic; the FastAPI backend is the single source of truth.
- Forms: validate with zod + react-hook-form (or the template's existing pattern) on both client and server.
- Error reporting and logging hooks ready for Cloud Logging.

─── STEP 5: DEPLOYMENT ───
- Dockerfile for the frontend (multi-stage, standalone Next.js output, non-root user). Deploy to Cloud Run alongside the backend with the minimum instances at 0 and a budget alert in place. Wire the frontend's backend URL via environment config per environment (dev/prod).
- One command locally starts frontend + backend (docker compose or a Makefile), documented in the README and tested from a clean clone.
- CI (GitHub Actions): lint, typecheck, unit tests, production build, Playwright E2E, and an npm audit/dependency scan on every PR.

─── STEP 6: QUALITY GATES ───
- Zero TypeScript errors, zero lint errors, production build passes, Lighthouse performance/accessibility/best-practices checked on landing and dashboard (aim 90+), no console errors.
- Playwright E2E tests: sign-up → register agent → set policy → agent action blocked → approval requested → approve → audit entry verified. Also tests for unauthorized access, expired session and backend-down error states.
- Visual QA: compare against the "before" baseline screenshots, confirm the design language is preserved, and screenshot every new page in light/dark and mobile/desktop.
- Update PROGRESS.md and LEARN.md (explain in plain English how Next.js routing, Tailwind v4, shadcn components, Firebase Auth tokens, and the API client fit together, with likely judge questions). I must be able to explain this frontend live.

─── WORKING RULES ───
Create GitHub issues for each step, use feature branches and PRs, and commit small and often with real work only. Don't skip a step's verification. If the template's structure differs from what is described here, adapt, report what you found, and keep going. Ask me ONLY if truly blocked.

Begin with STEP 1 now and report your findings from the repo inspection before moving on.