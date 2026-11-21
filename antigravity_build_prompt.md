# ANTIGRAVITY BUILD PROMPT — Passport "Trust Triptych" UI

> Paste everything below this line into Antigravity AI.

---

You are implementing a premium, cinematic card system in the **Passport** frontend (Next.js 16 App Router · React 19 · TypeScript 5 strict · Tailwind CSS v4). Passport is the zero-trust identity, delegation, guardrail-policy and spend-velocity control layer for autonomous AI agents.

The design comes from a reference spec (`ui_good.md`): a fixed 1690×950 canvas hero with three signature cards. Its visual system has been ported **faithfully** (the planet-limb gradient swell, the orbit + sphere with a hover telemetry scramble, the thin colour strip that expands into a drifting bloom, the glass pills, the tuned keyframes) and its entire domain content has been **replaced with Passport's real domain**. Implement exactly what is below. Do not redesign, simplify or "improve" it.

## What each card now represents

| Reference card | Passport card | Passport domain content |
|---|---|---|
| Globe + region pills + "streaming live" | **Cryptographic agent identity** (`IdentityCard`) | `agent_errand_01`, `ed25519:7a4f…3a5f`, "Passes live", "+11 active passes" |
| Orbit + sphere + 3 telemetry pills | **Real-time policy kernel** (`PolicyKernelCard`) | `0.082 ms · eval`, `98.4 % blocked`, `128 k calls/s` (numbers scramble on hover) |
| "Adaptive." status band | **Verifiable accountability** (`AccountabilityCard`) | HITL spend `$28.50 held for approval`, flight-recorder hash chain `1,048 intact` |

## Ground rules

1. **No new dependencies.** Only `react`, `next/link` and `lucide-react` (`Fingerprint`, `Eye`, `Activity`), all already in the project.
2. **Do not edit existing components or pages** beyond the explicit insertions in Phase 3.
3. **Keep the CSS in its own unlayered file.** It deliberately lives outside Tailwind layers so it beats preflight; do not convert it to utility classes (the nine-stop gradient stacks, pseudo-elements and keyframes would lose fidelity).
4. **Do not remove the `&nbsp;`** in the telemetry pills, the fixed `min-width: Nch` on the telemetry numbers, or the 650px-tall cards inside the 586px grid. Those are intentional (anti-jitter spacing and deliberately clipped card bottoms).
5. **Fonts.** `--pt-sans` falls back to Arial. If `frontend/src/app/layout.tsx` exposes DM Sans through a `next/font` CSS variable, replace `--font-dm-sans` in the first CSS rule with that variable's real name. Numbers, ids and fingerprints use the mono stack by design.
6. **Never hard-code live numbers inside the components.** The defaults are only fallbacks; pass real values via props (see the data-binding table in Phase 3). Do not invent API endpoints: reuse the data fetchers the pages already use.

---

## PHASE 1 — Component code

Create each file below with **exactly** this content (complete files, nothing omitted).

### 1.1 `frontend/src/components/trust-triptych/trust-triptych.css`

_The stylesheet (all gradient, pseudo-element, keyframe and hover choreography lives here)._

```css
/* =============================================================================
   Passport trust triptych
   Unlayered on purpose: it must win over Tailwind v4's preflight/utilities layers.
   Reflow is driven by data-stacked / data-narrow (set from JS) so the very same
   rules serve the full-bleed hero (viewport) and embedded stages (container).
   ========================================================================== */

/* ---------- Tokens ---------- */
.pt-hero,
.pt-stage-host {
  --pt-ink: #f7f5f2;
  --pt-muted: #aaa7aa;
  --pt-panel: #05070d;
  --pt-line: rgba(184, 198, 229, 0.22);
  /* Swap --font-dm-sans for whatever variable layout.tsx exposes for DM Sans. */
  --pt-sans: var(--font-dm-sans, Arial), Arial, Helvetica, sans-serif;
  --pt-serif: "Times New Roman", Times, serif;
  --pt-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  color: var(--pt-ink);
  color-scheme: dark;
  font-family: var(--pt-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}

.pt-hero *,
.pt-hero *::before,
.pt-hero *::after,
.pt-stage-host *,
.pt-stage-host *::before,
.pt-stage-host *::after {
  box-sizing: border-box;
}

/* ---------- Embedded stage (scaled composition inside the app shell) ---------- */
.pt-stage-host {
  position: relative;
  width: 100%;
}
.pt-stage-box {
  margin-inline: auto;
}
.pt-stage {
  position: relative;
  overflow: hidden;
  transform-origin: 0 0;
}
.pt-stage .pt-cards {
  position: relative;
  left: 0;
  top: 0;
}
.pt-stage > .pt-card {
  width: 100%;
}

/* ---------- Full-bleed hero canvas ---------- */
.pt-hero {
  position: fixed;
  inset: 0;
  z-index: 40;
  overflow: hidden;
  background: var(--pt-panel);
}
.pt-canvas {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1690px;
  height: 950px;
  overflow: hidden;
  transform-origin: 50% 50%;
  isolation: isolate;
  background: var(--pt-panel);
}
.pt-shell {
  position: absolute;
  z-index: 5;
  left: 0;
  top: 0;
  width: 1690px;
  height: 950px;
  overflow: hidden;
  border-radius: 0;
  background: var(--pt-panel);
  box-shadow: none;
}

/* ---------- Nav ---------- */
.pt-nav {
  position: absolute;
  left: 168px;
  right: 177px;
  top: 37px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pt-brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #f9f7f4;
  font-size: 20px;
  line-height: 24px;
  font-weight: 700;
  letter-spacing: -0.45px;
}
.pt-brand-mark {
  position: relative;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(145deg, #8cecfb 0%, #22d3ee 38%, #06b6d4 66%, #8b5cf6 100%);
  box-shadow: 0 0 13px rgba(6, 182, 212, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.pt-brand-mark::before,
.pt-brand-mark::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
}
.pt-brand-mark::before {
  top: 5px;
  border-bottom: 6px solid var(--pt-panel);
}
.pt-brand-mark::after {
  bottom: 5px;
  border-top: 6px solid var(--pt-panel);
}
.pt-nav-links {
  display: flex;
  gap: 6px;
  align-items: center;
  color: #5d5a5b;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  letter-spacing: -0.15px;
}
.pt-nav-links a {
  color: inherit;
  text-decoration: none;
  transition: color 160ms ease-out;
}
.pt-nav-links a:hover,
.pt-nav-links a:focus-visible {
  color: #c2cbe6;
}

/* ---------- Intro ---------- */
.pt-intro {
  position: absolute;
  left: 169px;
  top: 89px;
  width: 620px;
}
.pt-intro h1 {
  margin: 0;
  letter-spacing: -2.8px;
  font-weight: 300;
}
.pt-headline-sans {
  display: block;
  color: #aaa6a8;
  font-size: 60px;
  line-height: 66px;
  font-weight: 300;
}
.pt-headline-serif {
  display: block;
  color: #fffefd;
  font-family: var(--pt-serif);
  font-size: 58px;
  line-height: 64px;
  font-weight: 700;
  letter-spacing: -3.15px;
}
.pt-intro p {
  width: 585px;
  margin: 25px 0 0;
  color: #a29f9e;
  font-family: var(--pt-serif);
  font-size: 18px;
  line-height: 30px;
  font-weight: 400;
  letter-spacing: -0.52px;
}

/* ---------- Card grid ---------- */
.pt-cards {
  position: absolute;
  left: 169px;
  top: 322px;
  display: grid;
  grid-template-columns: 440px 439px 441px;
  gap: 12px;
  width: 1344px;
  height: 586px;
  overflow: hidden;
}
/* Cards are intentionally 650px tall inside a 586px grid: the bottoms are clipped. */
.pt-card {
  position: relative;
  height: 650px;
  min-width: 0;
  overflow: hidden;
  contain: paint;
  border: 1px solid rgba(12, 18, 32, 0.5);
  border-top-color: rgba(25, 35, 65, 0.14);
  background: #020204;
}
.pt-card:focus-visible {
  outline: 1px solid rgba(175, 198, 255, 0.52);
  outline-offset: -2px;
}
.pt-card-left,
.pt-card-middle,
.pt-card-right {
  background-origin: border-box;
  background-clip: border-box;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

/* ---------- Shared chrome ---------- */
.pt-card-icon {
  position: absolute;
  z-index: 6;
  left: 25px;
  top: 25px;
  width: 25px;
  height: 25px;
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.1));
}
.pt-glass-pill {
  position: absolute;
  z-index: 7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 22px;
  padding: 0 9px;
  border: 1px solid rgba(137, 158, 210, 0.3);
  border-radius: 999px;
  color: #c2cbe6;
  background: rgba(7, 16, 39, 0.68);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 4px 13px rgba(0, 0, 0, 0.2),
    0 0 14px rgba(45, 97, 255, 0.1);
  -webkit-backdrop-filter: blur(13px) saturate(150%);
  backdrop-filter: blur(13px) saturate(150%);
  white-space: nowrap;
  font-size: 12px;
  line-height: 20px;
  font-weight: 600;
  letter-spacing: -0.18px;
}
.pt-dot {
  flex: 0 0 auto;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #7adcc0;
  box-shadow: 0 0 3px rgba(122, 220, 192, 0.5);
}
.pt-blocked .pt-dot {
  background: #d4e8ff;
  box-shadow: 0 0 4px rgba(200, 220, 255, 0.5);
}
.pt-dot.yellow {
  background: #ffd462;
  box-shadow: 0 0 5px #ffd462, 0 0 13px rgba(255, 197, 68, 0.82);
}
.pt-dot.violet {
  background: #c69ff7;
  box-shadow: 0 0 3px rgba(190, 150, 240, 0.4);
}
.pt-dot.rose {
  background: #fb7185;
  box-shadow: 0 0 5px #fb7185, 0 0 13px rgba(244, 63, 94, 0.7);
}
.pt-card-title {
  position: absolute;
  z-index: 7;
  margin: 0;
  font-family: var(--pt-serif);
  color: #c7cfcc;
  font-weight: 400;
  letter-spacing: -0.95px;
}

/* ---------- Card 1: cryptographic identity ---------- */
.pt-card-left {
  background: #000;
}
.pt-left-surface {
  position: absolute;
  z-index: 0;
  inset: -1px;
  overflow: hidden;
  background: #000;
  transform: scaleY(1);
  transform-origin: 50% 100%;
  transition:
    transform 720ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 720ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, filter;
}
.pt-left-surface::before {
  content: "";
  position: absolute;
  left: -2.5%;
  top: 32%;
  width: 105%;
  height: 84%;
  border-radius: 50% 50% 0 0 / 7% 7% 0 0; /* the planet-limb curve */
  background:
    radial-gradient(
      ellipse 58% 16% at 50% 0%,
      rgba(16, 0, 224, 0.84) 0%,
      rgba(8, 0, 181, 0.58) 43%,
      rgba(2, 0, 118, 0.18) 72%,
      transparent 100%
    ),
    linear-gradient(
      180deg,
      #0700a4 0%,
      #06019f 5%,
      #06148f 12%,
      #0a3385 20%,
      #13517a 30%,
      #19646d 42%,
      #1c6762 53%,
      #1d5a53 64%,
      #1d4842 74%,
      #1a332e 83%,
      #111d17 93%,
      #0e140e 100%
    );
  filter: blur(14px);
  box-shadow: 0 -9px 24px rgba(0, 0, 156, 0.34), inset 0 8px 22px rgba(9, 0, 178, 0.22);
}
.pt-card-left:hover .pt-left-surface,
.pt-card-left:focus-visible .pt-left-surface {
  transform: scaleY(1.075);
  filter: saturate(1.34) brightness(1.08) contrast(1.04);
}
.pt-pill-agent,
.pt-pill-key,
.pt-pill-passes {
  min-height: 28px;
  padding: 0 11px;
  color: #d6dced;
  border-color: rgba(125, 145, 202, 0.32);
  background: rgba(4, 10, 28, 0.57);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055), 0 4px 12px rgba(0, 0, 0, 0.17);
  -webkit-backdrop-filter: blur(8px) saturate(125%);
  backdrop-filter: blur(8px) saturate(125%);
  font-family: var(--pt-mono);
  font-size: 11px;
  line-height: 26px;
  font-weight: 600;
  letter-spacing: -0.1px;
}
.pt-pill-agent {
  left: 32px;
  top: 79px;
}
.pt-pill-key {
  right: 32px;
  top: 82px;
}
.pt-pill-passes {
  left: 56px;
  top: 438px;
}
.pt-live {
  left: 142px;
  top: 256.333px;
  width: 156px;
  height: 39px;
  min-height: 0;
  padding: 0;
  gap: 8px;
  color: rgba(211, 232, 248, 0.88);
  border: 1px solid transparent;
  border-radius: 20px;
  background:
    linear-gradient(
        180deg,
        rgba(29, 62, 138, 0.9) 0%,
        rgba(23, 53, 123, 0.91) 46%,
        rgba(14, 42, 99, 0.92) 100%
      )
      padding-box,
    linear-gradient(
        180deg,
        rgba(135, 155, 244, 0.55) 0%,
        rgba(104, 135, 212, 0.48) 55%,
        rgba(86, 123, 191, 0.55) 100%
      )
      border-box;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(44, 82, 155, 0.25),
    0 0 14px rgba(41, 74, 216, 0.18);
  -webkit-backdrop-filter: blur(7px) saturate(130%);
  backdrop-filter: blur(7px) saturate(130%);
  font-size: 13px;
  line-height: 37px;
  font-weight: 600;
  letter-spacing: -0.18px;
}
.pt-live .pt-dot {
  width: 6px;
  height: 6px;
  background: #67dba9;
  box-shadow: 0 0 5px rgba(103, 219, 169, 0.78), 0 0 11px rgba(76, 210, 157, 0.45);
  animation: pt-live-signal 1.55s ease-in-out infinite;
}
.pt-live-copy {
  transform: translate(-1px, 0.5px) scaleY(0.92);
  text-shadow: 0 0 1px rgba(211, 232, 248, 0.32);
}
.pt-card-left .pt-card-title {
  left: 24px;
  top: 500px;
  width: 385px;
  font-size: 27px;
  line-height: 34px;
}
.pt-card-left .pt-card-title strong {
  font-weight: 700;
  color: #f4f8f7;
}

/* ---------- Card 2: real-time policy kernel ---------- */
.pt-card-middle {
  background:
    linear-gradient(90deg, transparent 0%, transparent 99%, rgba(8, 14, 26, 0.22) 100%),
    radial-gradient(
      ellipse 156px 164px at 54% 26.2%,
      rgba(88, 120, 240, 0.45) 0%,
      rgba(88, 120, 240, 0.35) 35%,
      rgba(88, 120, 240, 0.14) 60%,
      rgba(88, 120, 240, 0.04) 80%,
      rgba(88, 120, 240, 0) 100%
    ),
    radial-gradient(ellipse 220px 95px at 50% 63%, rgba(50, 90, 210, 0.24), transparent 75%),
    radial-gradient(ellipse 100px 140px at 87% 44%, rgba(30, 90, 220, 0.21), transparent 75%),
    radial-gradient(ellipse 170px 150px at 20% 36%, rgba(48, 88, 200, 0.12), transparent 78%),
    radial-gradient(
      ellipse 158px 118px at 105% 34.5%,
      rgba(20, 138, 250, 0.6) 0%,
      rgba(20, 138, 250, 0.5) 40%,
      rgba(20, 138, 250, 0.26) 62%,
      rgba(20, 138, 250, 0.1) 80%,
      rgba(20, 138, 250, 0) 100%
    ),
    radial-gradient(
      ellipse 268px 184px at 104% 31%,
      rgba(10, 70, 235, 0.48) 0%,
      rgba(10, 70, 235, 0.3) 50%,
      rgba(10, 70, 235, 0.1) 75%,
      rgba(10, 70, 235, 0) 100%
    ),
    radial-gradient(
      ellipse 235px 170px at 103% 50%,
      rgba(22, 148, 210, 0.3) 0%,
      rgba(22, 148, 210, 0.2) 55%,
      rgba(22, 148, 210, 0) 100%
    ),
    radial-gradient(ellipse 160px 120px at 105% 70.8%, rgba(30, 130, 95, 0.09), transparent 85%),
    linear-gradient(
      180deg,
      #0d174d 0%,
      #061b5f 0.31%,
      #071c60 0.77%,
      #082166 3.1%,
      #0e2670 6.2%,
      #132f7c 12.3%,
      #143281 18.5%,
      #163588 24.6%,
      #1c409f 30.8%,
      #2044a1 36.9%,
      #23479b 43.1%,
      #254691 49.2%,
      #264387 52.3%,
      #224076 58.5%,
      #203867 64.6%,
      #1a3059 70.8%,
      #162545 76.9%,
      #0b1631 83.1%,
      #050b1c 88.5%,
      #030712 93.8%,
      #02040c 100%
    );
}
.pt-card-site {
  position: absolute;
  z-index: 7;
  right: 23px;
  top: 33px;
  color: rgba(238, 244, 255, 0.62);
  font-family: var(--pt-mono);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: -0.1px;
}
.pt-orbit {
  position: absolute;
  z-index: 2;
  left: 30px;
  top: 91px;
  width: 379px;
  height: 379px;
  border: 1px dashed rgba(145, 184, 255, 0.24);
  border-radius: 50%;
  transform-origin: 50% 50%;
  animation: pt-orbit-spin 28s linear infinite;
  will-change: transform;
}
.pt-orbit::before,
.pt-orbit::after {
  content: "";
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #cfe2ff;
  box-shadow: 0 0 4px rgba(160, 200, 255, 0.6);
}
.pt-orbit::before {
  left: 45px;
  top: 59px;
}
.pt-orbit::after {
  right: 9px;
  top: 92px;
  background: rgba(190, 212, 255, 0.55);
  box-shadow: 0 0 4px rgba(150, 190, 255, 0.3);
}
.pt-orbit-dot-bottom {
  position: absolute;
  left: 54px;
  bottom: 43px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9db8ea;
  box-shadow: 0 0 5px rgba(150, 180, 240, 0.4);
}
.pt-sphere {
  position: absolute;
  z-index: 3;
  left: 95px;
  top: 158px;
  width: 249px;
  height: 249px;
  border-radius: 50%;
  filter: blur(1.4px);
  background:
    radial-gradient(
      circle closest-side at 50% 50%,
      transparent 0 80%,
      rgba(125, 108, 112, 0.11) 93%,
      rgba(125, 108, 112, 0.07) 100%
    ),
    radial-gradient(ellipse 36px 150px at 0% 50%, rgba(10, 28, 40, 0.62), transparent 70%),
    radial-gradient(ellipse 64px 156px at 100% 52%, rgba(64, 112, 128, 0.38), transparent 70%),
    radial-gradient(ellipse 215px 112px at 52% 106%, rgba(18, 158, 160, 0.52), transparent 72%),
    linear-gradient(
      180deg,
      #163a3e 0%,
      #163a3e 6%,
      #124444 26%,
      #0c5a55 50%,
      #086e6a 75%,
      #0a7876 92%,
      #0b7c7a 100%
    );
  box-shadow: inset 0 4px 18px rgba(6, 26, 34, 0.08), 0 0 26px rgba(70, 110, 200, 0.28);
}
.pt-latency {
  right: 38px;
  top: 98px;
}
.pt-blocked {
  left: 41px;
  top: 270px;
}
.pt-calls {
  left: 60px;
  top: 447px;
}
.pt-telemetry-number {
  display: inline-block;
  font-family: var(--pt-mono);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
/* Fixed widths stop the pills jittering while the numbers cycle. */
.pt-latency .pt-telemetry-number {
  min-width: 5ch;
}
.pt-blocked .pt-telemetry-number {
  min-width: 4ch;
}
.pt-calls .pt-telemetry-number {
  min-width: 3ch;
}
.pt-card-middle .pt-card-copy {
  position: absolute;
  z-index: 7;
  left: 23px;
  top: 514px;
  width: 375px;
  margin: 0;
  color: #c5cada;
  font-size: 19px;
  line-height: 27px;
  font-weight: 400;
  letter-spacing: -0.52px;
}

/* ---------- Card 3: verifiable accountability ---------- */
.pt-card-right {
  background: #030408;
}
.pt-card-right .pt-status-band {
  position: absolute;
  z-index: 1;
  inset: 0;
  overflow: hidden;
  clip-path: inset(199px 0 calc(100% - 355px) 0); /* collapsed to a horizontal band */
  background:
    radial-gradient(
      ellipse 330px 390px at 108% 67%,
      rgba(255, 128, 18, 0.94) 0%,
      rgba(225, 69, 12, 0.55) 46%,
      transparent 72%
    ),
    radial-gradient(
      ellipse 360px 330px at 8% 36%,
      rgba(12, 3, 224, 0.98) 0%,
      rgba(6, 9, 145, 0.74) 48%,
      transparent 74%
    ),
    radial-gradient(
      ellipse 440px 280px at 44% 108%,
      rgba(207, 29, 24, 0.84) 0%,
      rgba(111, 20, 43, 0.42) 55%,
      transparent 80%
    ),
    linear-gradient(145deg, #050015 0%, #07052f 35%, #151931 60%, #4d251a 100%);
  transition: clip-path 390ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: clip-path;
}
.pt-status-band::before,
.pt-status-band::after {
  content: "";
  position: absolute;
  pointer-events: none;
}
/* The green "approved" bloom, hidden until hover. */
.pt-status-band::before {
  inset: -12%;
  opacity: 0;
  background:
    radial-gradient(
      ellipse 225px 350px at 78% 46%,
      rgba(45, 236, 112, 0.9) 0%,
      rgba(43, 186, 112, 0.52) 36%,
      transparent 68%
    ),
    radial-gradient(ellipse 260px 300px at 57% 24%, rgba(18, 116, 255, 0.64) 0%, transparent 72%),
    radial-gradient(ellipse 310px 280px at 42% 84%, rgba(255, 167, 27, 0.52) 0%, transparent 72%);
  filter: blur(10px) saturate(1.13);
  transform: translate3d(8%, 1%, 0) scale(1.04);
  transition: opacity 310ms ease-out;
  animation: pt-adaptive-drift 2.8s ease-in-out infinite alternate;
  animation-play-state: paused;
  will-change: transform, opacity;
}
/* The crisp resting band, fades out on hover. */
.pt-status-band::after {
  left: 0;
  right: 0;
  top: 199px;
  height: 156px;
  background:
    radial-gradient(ellipse 255px 190px at 104% 50%, rgba(255, 125, 18, 0.92), transparent 69%),
    radial-gradient(ellipse 350px 200px at 5% 48%, rgba(12, 2, 220, 0.94), transparent 68%),
    radial-gradient(ellipse at 55% 50%, transparent 0%, rgba(3, 4, 19, 0.24) 72%),
    linear-gradient(90deg, #08008d 0%, #12134d 53%, #9a471b 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.46);
  opacity: 1;
  transition: opacity 210ms ease-out;
}
/* Signature interaction: the strip expands to fill the card and the bloom drifts. */
.pt-card-right:hover .pt-status-band,
.pt-card-right:focus-visible .pt-status-band {
  clip-path: inset(0);
}
.pt-card-right:hover .pt-status-band::before,
.pt-card-right:focus-visible .pt-status-band::before {
  opacity: 0.82;
  animation-play-state: running;
}
.pt-card-right:hover .pt-status-band::after,
.pt-card-right:focus-visible .pt-status-band::after {
  opacity: 0;
}
.pt-status-stack {
  position: absolute;
  z-index: 4;
  inset: 0;
  pointer-events: none;
}
.pt-status {
  position: absolute;
  z-index: 4;
  left: 34px;
  right: 35px;
  height: 37px;
  display: flex;
  align-items: center;
  padding: 0 13px;
  border: 1px solid rgba(159, 164, 208, 0.27);
  border-radius: 11px;
  color: #e3e4f2;
  background: rgba(10, 12, 31, 0.62);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 5px 20px rgba(0, 0, 0, 0.16);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  backdrop-filter: blur(14px) saturate(140%);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: -0.1px;
}
.pt-status:first-child {
  top: 242px;
}
.pt-status:last-child {
  top: 287px;
}
.pt-status .pt-dot {
  margin-right: 9px;
}
.pt-status em {
  margin-left: auto;
  padding-left: 10px;
  color: #d48aff;
  font-family: var(--pt-mono);
  font-style: normal;
  font-size: 11px;
  white-space: nowrap;
}
.pt-status:last-child em {
  color: #a9e49f;
}
.pt-status.pt-status-alert {
  border-color: rgba(251, 113, 133, 0.4);
}
.pt-status.pt-status-alert em {
  color: #fb7185;
}
.pt-status:first-child .pt-dot {
  animation: pt-status-signal 1.85s ease-in-out infinite 0.15s;
}
.pt-status:last-child .pt-dot {
  animation: pt-status-signal 2.15s ease-in-out infinite 0.8s;
}
.pt-card-right .pt-card-title {
  left: 22px;
  top: 502px;
  font-size: 59px;
  line-height: 70px;
  font-weight: 700;
  letter-spacing: -3.1px;
  color: #fff;
}

/* ---------- Keyframes ---------- */
@keyframes pt-live-signal {
  0%,
  18%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  42%,
  62% {
    opacity: 0.22;
    transform: scale(0.72);
  }
  78% {
    opacity: 0.95;
    transform: scale(1.08);
  }
}
@keyframes pt-status-signal {
  0%,
  24%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  52%,
  68% {
    opacity: 0.28;
    transform: scale(0.75);
  }
}
@keyframes pt-orbit-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes pt-orbit-spin-mobile {
  from {
    transform: translateX(-50%) rotate(0deg);
  }
  to {
    transform: translateX(-50%) rotate(360deg);
  }
}
@keyframes pt-adaptive-drift {
  0% {
    transform: translate3d(9%, -1%, 0) scale(1.04) rotate(-1deg);
  }
  48% {
    transform: translate3d(1%, 3%, 0) scale(1.08) rotate(1deg);
  }
  100% {
    transform: translate3d(-8%, -2%, 0) scale(1.05) rotate(-0.5deg);
  }
}

/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .pt-left-surface,
  .pt-card-right .pt-status-band,
  .pt-status-band::before,
  .pt-status-band::after {
    transition-duration: 1ms;
  }
  .pt-live .pt-dot,
  .pt-status .pt-dot,
  .pt-orbit,
  .pt-status-band::before {
    animation: none;
  }
}

/* =============================================================================
   Stacked reflow (hero: viewport < 700px · embedded strip: container < stackBelow)
   Above the threshold the composition is never re-flowed, only uniformly scaled.
   ========================================================================== */
.pt-hero[data-stacked="true"] {
  overflow-x: hidden;
  overflow-y: auto;
}
[data-stacked="true"] .pt-canvas {
  position: relative;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;
  min-height: 100dvh;
  padding: 0;
  transform: none;
}
[data-stacked="true"] .pt-shell {
  position: relative;
  left: auto;
  top: auto;
  width: 100%;
  height: auto;
  min-height: 100dvh;
  padding: 0 20px 20px;
  border-radius: 0;
  box-shadow: none;
}
[data-stacked="true"] .pt-nav {
  position: relative;
  left: auto;
  right: auto;
  top: auto;
  height: 70px;
}
[data-stacked="true"] .pt-brand {
  font-size: 18px;
}
[data-stacked="true"] .pt-brand-mark {
  width: 22px;
  height: 22px;
  border-radius: 6px;
}
[data-stacked="true"] .pt-nav-links {
  font-size: 11px;
}
[data-stacked="true"] .pt-intro {
  position: relative;
  left: auto;
  top: auto;
  width: 100%;
  padding: 20px 0 37px;
}
[data-stacked="true"] .pt-headline-sans {
  font-size: clamp(39px, 12vw, 54px);
  line-height: 1.04;
  letter-spacing: -2.4px;
}
[data-stacked="true"] .pt-headline-serif {
  font-size: clamp(40px, 12.4vw, 56px);
  line-height: 1.04;
  letter-spacing: -2.7px;
}
[data-stacked="true"] .pt-intro p {
  width: 100%;
  margin-top: 22px;
  font-size: 16px;
  line-height: 26px;
  letter-spacing: -0.35px;
}
[data-stacked="true"] .pt-desktop-break {
  display: none;
}
[data-stacked="true"] .pt-cards {
  position: relative;
  left: auto;
  top: auto;
  width: 100%;
  height: auto;
  overflow: visible;
  grid-template-columns: 1fr;
  gap: 14px;
}
[data-stacked="true"] .pt-card {
  width: 100%;
  height: auto;
  min-height: 565px;
  border-radius: 1px;
}
[data-stacked="true"] .pt-card-left .pt-card-title,
[data-stacked="true"] .pt-card-middle .pt-card-copy,
[data-stacked="true"] .pt-card-right .pt-card-title {
  top: auto;
  bottom: 18px;
}
/* Desktop pins these to fixed pixel widths; track the card instead. */
[data-stacked="true"] .pt-card-left .pt-card-title {
  width: calc(100% - 44px);
}
[data-stacked="true"] .pt-pill-key {
  right: 24px;
}
[data-stacked="true"] .pt-live {
  left: 50%;
  transform: translateX(-50%);
}
[data-stacked="true"] .pt-pill-passes {
  top: 406px;
}
/* The ring is wider than a narrow card: cap it and keep it circular. */
[data-stacked="true"] .pt-orbit {
  left: 50%;
  transform: translateX(-50%);
  animation-name: pt-orbit-spin-mobile;
  width: min(379px, calc(100% - 32px));
  height: auto;
  aspect-ratio: 1;
}
[data-stacked="true"] .pt-sphere {
  left: 50%;
  transform: translateX(-50%);
  width: min(249px, calc(100% - 92px));
  height: auto;
  aspect-ratio: 1;
}
[data-stacked="true"] .pt-latency {
  right: 20px;
}
[data-stacked="true"] .pt-calls {
  top: 414px;
}
[data-stacked="true"] .pt-card-middle .pt-card-copy {
  width: calc(100% - 46px);
}
[data-stacked="true"] .pt-status {
  left: 20px;
  right: 20px;
}
[data-stacked="true"] .pt-card-right .pt-card-title {
  font-size: clamp(48px, 15vw, 59px);
}

/* Narrow phone tuning (<= 410px). */
[data-stacked="true"][data-narrow="true"] .pt-shell {
  padding-inline: 15px;
}
[data-stacked="true"][data-narrow="true"] .pt-intro {
  padding-top: 14px;
}
[data-stacked="true"][data-narrow="true"] .pt-nav-links > a:first-child {
  display: none; /* drops "Console" */
}
[data-stacked="true"][data-narrow="true"] .pt-cards {
  gap: 12px;
}
[data-stacked="true"][data-narrow="true"] .pt-card {
  min-height: 540px;
}
[data-stacked="true"][data-narrow="true"] .pt-pill-agent {
  left: 20px;
}
[data-stacked="true"][data-narrow="true"] .pt-pill-key {
  right: 20px;
}
[data-stacked="true"][data-narrow="true"] .pt-pill-passes {
  top: 380px;
}
[data-stacked="true"][data-narrow="true"] .pt-orbit {
  top: 108px;
}
[data-stacked="true"][data-narrow="true"] .pt-sphere {
  top: 171px;
}
[data-stacked="true"][data-narrow="true"] .pt-calls {
  left: 30px;
  top: 395px;
}
[data-stacked="true"][data-narrow="true"] .pt-card-left .pt-card-title {
  font-size: 25px;
}
```

### 1.2 `frontend/src/components/trust-triptych/data.ts`

_Shared types, default values, formatters._

```ts
/**
 * Shared types + default (static) values for the Passport trust triptych.
 * Every default mirrors the schemas in the Passport project brief and is meant to be
 * overridden with live values from the existing data layer.
 */

export interface TelemetryFrame {
  /** Policy-kernel evaluation latency, milliseconds, e.g. "0.082" */
  latencyMs: string;
  /** Share of hostile tool calls blocked, percent, e.g. "98.4" */
  blockedPct: string;
  /** Tool-call decisions per second, thousands, e.g. "128" */
  callsK: string;
}

export const DEFAULT_TELEMETRY_BASELINE: TelemetryFrame = {
  latencyMs: "0.082",
  blockedPct: "98.4",
  callsK: "128",
};

/** Decorative hover animation frames. The last frame equals the baseline. */
export const DEFAULT_TELEMETRY_FRAMES: readonly TelemetryFrame[] = [
  { latencyMs: "0.061", blockedPct: "97.1", callsK: "139" },
  { latencyMs: "0.094", blockedPct: "99.0", callsK: "104" },
  { latencyMs: "0.071", blockedPct: "98.2", callsK: "147" },
  { latencyMs: "0.109", blockedPct: "96.8", callsK: "116" },
  { latencyMs: "0.088", blockedPct: "98.9", callsK: "134" },
  { latencyMs: "0.066", blockedPct: "97.6", callsK: "112" },
  { latencyMs: "0.102", blockedPct: "99.3", callsK: "143" },
  { latencyMs: "0.082", blockedPct: "98.4", callsK: "128" },
];

/** "ed25519:7a4f9b2c8e1d3a5f" -> "ed25519:7a4f…3a5f" */
export function shortFingerprint(fingerprint: string): string {
  const [algorithm, hex] = fingerprint.split(":");
  if (!algorithm || !hex || hex.length <= 8) return fingerprint;
  return `${algorithm}:${hex.slice(0, 4)}\u2026${hex.slice(-4)}`;
}

/** Fixed-locale number formatting so server and client markup always match. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}
```

### 1.3 `frontend/src/components/trust-triptych/useStageFit.ts`

_Fit/scale hooks (viewport-contain for the hero, container-fit for embeds)._

```ts
"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export interface StageFit {
  /** False until the first measurement; callers hide the stage until then. */
  ready: boolean;
  scale: number;
  /** True when the composition must reflow into a single stacked column. */
  stacked: boolean;
  /** True on very narrow viewports/containers (<= 410px). */
  narrow: boolean;
}

const INITIAL_FIT: StageFit = { ready: false, scale: 1, stacked: false, narrow: false };
const NARROW_MAX = 410;

function sameFit(a: StageFit, b: StageFit): boolean {
  return (
    a.ready === b.ready &&
    a.stacked === b.stacked &&
    a.narrow === b.narrow &&
    Math.abs(a.scale - b.scale) < 0.0005
  );
}

/**
 * Viewport "contain" fit for the full-bleed hero canvas.
 * Math.min keeps the whole design visible at every aspect ratio (never crops).
 */
export function useViewportContain(
  designWidth: number,
  designHeight: number,
  stackBelow: number,
): StageFit {
  const [fit, setFit] = useState<StageFit>(INITIAL_FIT);

  useEffect(() => {
    const measure = (): void => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const stacked = width < stackBelow;
      const next: StageFit = {
        ready: true,
        stacked,
        narrow: width <= NARROW_MAX,
        scale: stacked ? 1 : Math.min(width / designWidth, height / designHeight),
      };
      setFit((prev) => (sameFit(prev, next) ? prev : next));
    };

    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [designWidth, designHeight, stackBelow]);

  return fit;
}

/**
 * Container-width fit for stages embedded inside the app shell (dashboard, agents, ...).
 * Scales to the host's width, never above `maxScale`, and stacks below `stackBelow` px.
 */
export function useContainerFit(
  designWidth: number,
  stackBelow: number,
  maxScale: number,
): { hostRef: RefObject<HTMLDivElement | null>; fit: StageFit } {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState<StageFit>(INITIAL_FIT);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const measure = (): void => {
      const width = host.clientWidth;
      if (width === 0) return;
      const stacked = stackBelow > 0 && width < stackBelow;
      const next: StageFit = {
        ready: true,
        stacked,
        narrow: width <= NARROW_MAX,
        scale: stacked ? 1 : Math.min(maxScale, width / designWidth),
      };
      setFit((prev) => (sameFit(prev, next) ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [designWidth, stackBelow, maxScale]);

  return { hostRef, fit };
}
```

### 1.4 `frontend/src/components/trust-triptych/ScaledStage.tsx`

_Scales a fixed-size composition to its container._

```tsx
"use client";

import type { ReactNode } from "react";
import { useContainerFit } from "./useStageFit";
import "./trust-triptych.css";

export interface ScaledStageProps {
  /** Width of the fixed design composition, in px. */
  designWidth: number;
  /** Height of the fixed design composition, in px. */
  designHeight: number;
  /** Reflow into a stacked column when the host is narrower than this (0 = never). */
  stackBelow?: number;
  /** Upper bound for the scale factor (1 = never enlarge past design size). */
  maxScale?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Renders a fixed-size composition uniformly scaled to fit its container, so the
 * pixel-positioned trust cards keep their exact layout inside the app shell.
 */
export function ScaledStage({
  designWidth,
  designHeight,
  stackBelow = 0,
  maxScale = 1,
  className,
  children,
}: ScaledStageProps) {
  const { hostRef, fit } = useContainerFit(designWidth, stackBelow, maxScale);

  return (
    <div
      ref={hostRef}
      className={`pt-stage-host${className ? ` ${className}` : ""}`}
      data-stacked={fit.stacked}
      data-narrow={fit.narrow}
      style={{ visibility: fit.ready ? "visible" : "hidden" }}
    >
      <div
        className="pt-stage-box"
        style={
          fit.stacked
            ? undefined
            : {
                width: designWidth * fit.scale,
                height: designHeight * fit.scale,
              }
        }
      >
        <div
          className="pt-stage"
          style={
            fit.stacked
              ? undefined
              : {
                  width: designWidth,
                  height: designHeight,
                  transform: `scale(${fit.scale})`,
                }
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
```

### 1.5 `frontend/src/components/trust-triptych/IdentityCard.tsx`

_Card 1: cryptographic agent identity._

```tsx
import { Fingerprint } from "lucide-react";
import { formatCount, shortFingerprint } from "./data";
import "./trust-triptych.css";

export interface IdentityCardProps {
  /** Agent shown in the top-left pill, e.g. "agent_errand_01". */
  agentId?: string;
  /** Full Ed25519 key fingerprint, e.g. "ed25519:7a4f9b2c8e1d3a5f". */
  fingerprint?: string;
  /** Number of additional active passes beyond the one shown. */
  additionalPasses?: number;
}

export function IdentityCard({
  agentId = "agent_errand_01",
  fingerprint = "ed25519:7a4f9b2c8e1d3a5f",
  additionalPasses = 11,
}: IdentityCardProps) {
  return (
    <article className="pt-card pt-card-left" aria-label="Cryptographic agent identity" tabIndex={0}>
      <div className="pt-left-surface" aria-hidden="true" />
      <Fingerprint className="pt-card-icon" strokeWidth={2.1} aria-hidden="true" />

      <span className="pt-glass-pill pt-pill-agent">{agentId}</span>
      <span className="pt-glass-pill pt-pill-key">{shortFingerprint(fingerprint)}</span>
      <span className="pt-glass-pill pt-live">
        <i className="pt-dot" />
        <span className="pt-live-copy">Passes live</span>
      </span>
      <span className="pt-glass-pill pt-pill-passes">
        +{formatCount(additionalPasses)} active passes
      </span>

      <h2 className="pt-card-title">
        Ephemeral identity for <strong>every autonomous agent.</strong>
      </h2>
    </article>
  );
}
```

### 1.6 `frontend/src/components/trust-triptych/PolicyKernelCard.tsx`

_Card 2: real-time policy kernel (telemetry scramble on hover)._

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import {
  DEFAULT_TELEMETRY_BASELINE,
  DEFAULT_TELEMETRY_FRAMES,
  type TelemetryFrame,
} from "./data";
import "./trust-triptych.css";

const FRAME_INTERVAL_MS = 105;

export interface PolicyKernelCardProps {
  /** Live values shown at rest and restored when the hover animation stops. */
  baseline?: TelemetryFrame;
  /** Frames cycled on hover/focus. Purely decorative. */
  frames?: readonly TelemetryFrame[];
  /** Small label top-right of the card. */
  siteLabel?: string;
}

export function PolicyKernelCard({
  baseline = DEFAULT_TELEMETRY_BASELINE,
  frames = DEFAULT_TELEMETRY_FRAMES,
  siteLabel = "policy.kernel",
}: PolicyKernelCardProps) {
  const [frameIndex, setFrameIndex] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const stop = useCallback((): void => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setFrameIndex(null);
  }, []);

  const start = useCallback((): void => {
    if (timerRef.current !== null || frames.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;
    setFrameIndex(0);
    timerRef.current = window.setInterval(() => {
      index = (index + 1) % frames.length;
      setFrameIndex(index);
    }, FRAME_INTERVAL_MS);
  }, [frames]);

  useEffect(() => {
    const onVisibility = (): void => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [stop]);

  const shown: TelemetryFrame =
    frameIndex === null ? baseline : (frames[frameIndex] ?? baseline);

  return (
    <article
      className="pt-card pt-card-middle"
      aria-label="Real-time policy enforcement"
      tabIndex={0}
      onPointerEnter={start}
      onFocus={start}
      onPointerLeave={stop}
      onBlur={stop}
    >
      <Eye className="pt-card-icon" strokeWidth={2.1} aria-hidden="true" />
      <span className="pt-card-site">{siteLabel}</span>

      <div className="pt-orbit" aria-hidden="true">
        <span className="pt-orbit-dot-bottom" />
      </div>
      <div className="pt-sphere" aria-hidden="true" />

      <span className="pt-glass-pill pt-latency">
        <i className="pt-dot" />
        <span className="pt-telemetry-number">{shown.latencyMs}</span>&nbsp; ms · eval
      </span>
      <span className="pt-glass-pill pt-blocked">
        <i className="pt-dot" />
        <span className="pt-telemetry-number">{shown.blockedPct}</span>&nbsp; % blocked
      </span>
      <span className="pt-glass-pill pt-calls">
        <i className="pt-dot violet" />
        <span className="pt-telemetry-number">{shown.callsK}</span>&nbsp; k calls/s
      </span>

      <p className="pt-card-copy">Every tool call inspected before it touches the wire.</p>
    </article>
  );
}
```

### 1.7 `frontend/src/components/trust-triptych/AccountabilityCard.tsx`

_Card 3: HITL approvals + flight-recorder verification (band-expand hover)._

```tsx
import { Activity } from "lucide-react";
import { formatCount, formatUsd } from "./data";
import "./trust-triptych.css";

export interface PendingApprovalSummary {
  /** Requested spend awaiting a human decision, in USD. */
  amountUsd: number;
}

export interface AuditChainSummary {
  blocks: number;
  /** Result of the latest SHA-256 hash-chain verification. */
  intact: boolean;
}

export interface AccountabilityCardProps {
  /** Highest-priority pending HITL approval, or null when the queue is clear. */
  pendingApproval?: PendingApprovalSummary | null;
  chain?: AuditChainSummary;
}

export function AccountabilityCard({
  pendingApproval = { amountUsd: 28.5 },
  chain = { blocks: 1048, intact: true },
}: AccountabilityCardProps) {
  return (
    <article className="pt-card pt-card-right" aria-label="Verifiable accountability" tabIndex={0}>
      <Activity className="pt-card-icon" strokeWidth={2.3} aria-hidden="true" />
      <div className="pt-status-band" aria-hidden="true" />

      <div className="pt-status-stack">
        {pendingApproval ? (
          <div className="pt-status">
            <i className="pt-dot yellow" />
            <span>Spend {formatUsd(pendingApproval.amountUsd)} held for approval</span>
            <em>pending</em>
          </div>
        ) : (
          <div className="pt-status">
            <i className="pt-dot" />
            <span>No spend awaiting approval</span>
            <em>clear</em>
          </div>
        )}

        {chain.intact ? (
          <div className="pt-status">
            <i className="pt-dot" />
            <span>Flight recorder hash chain</span>
            <em>{formatCount(chain.blocks)} intact</em>
          </div>
        ) : (
          <div className="pt-status pt-status-alert">
            <i className="pt-dot rose" />
            <span>Flight recorder hash chain</span>
            <em>tamper detected</em>
          </div>
        )}
      </div>

      <h2 className="pt-card-title">Accountable.</h2>
    </article>
  );
}
```

### 1.8 `frontend/src/components/trust-triptych/TrustTriptych.tsx`

_The three cards as one scaled strip, for embedding in app pages._

```tsx
import { AccountabilityCard, type AccountabilityCardProps } from "./AccountabilityCard";
import { IdentityCard, type IdentityCardProps } from "./IdentityCard";
import { PolicyKernelCard, type PolicyKernelCardProps } from "./PolicyKernelCard";
import { ScaledStage } from "./ScaledStage";
import "./trust-triptych.css";

export interface TrustTriptychProps {
  identity?: IdentityCardProps;
  policy?: PolicyKernelCardProps;
  accountability?: AccountabilityCardProps;
  /** Container width (px) below which the three cards stack. Default 880. */
  stackBelow?: number;
  className?: string;
}

/** The three signature cards as one 1344×586 strip, scaled to its container. */
export function TrustTriptych({
  identity,
  policy,
  accountability,
  stackBelow = 880,
  className,
}: TrustTriptychProps) {
  return (
    <ScaledStage designWidth={1344} designHeight={586} stackBelow={stackBelow} className={className}>
      <section className="pt-cards" aria-label="Passport trust layer">
        <IdentityCard {...identity} />
        <PolicyKernelCard {...policy} />
        <AccountabilityCard {...accountability} />
      </section>
    </ScaledStage>
  );
}
```

### 1.9 `frontend/src/components/trust-triptych/TrustHero.tsx`

_Full-bleed 1690×950 cinematic hero, for the public landing route._

```tsx
"use client";

import Link from "next/link";
import { AccountabilityCard, type AccountabilityCardProps } from "./AccountabilityCard";
import { IdentityCard, type IdentityCardProps } from "./IdentityCard";
import { PolicyKernelCard, type PolicyKernelCardProps } from "./PolicyKernelCard";
import { useViewportContain } from "./useStageFit";
import "./trust-triptych.css";

const CANVAS_WIDTH = 1690;
const CANVAS_HEIGHT = 950;
const STACK_BELOW = 700;

export interface TrustHeroProps {
  identity?: IdentityCardProps;
  policy?: PolicyKernelCardProps;
  accountability?: AccountabilityCardProps;
}

/**
 * Full-viewport cinematic hero: a fixed 1690×950 design canvas, uniformly scaled to fit
 * (never cropped) at 700px and wider, reflowing into one column below 700px.
 */
export function TrustHero({ identity, policy, accountability }: TrustHeroProps) {
  const fit = useViewportContain(CANVAS_WIDTH, CANVAS_HEIGHT, STACK_BELOW);

  return (
    <div
      className="pt-hero"
      data-stacked={fit.stacked}
      data-narrow={fit.narrow}
      style={{ visibility: fit.ready ? "visible" : "hidden" }}
    >
      <div
        className="pt-canvas"
        style={
          fit.stacked
            ? undefined
            : { transform: `translate(-50%, -50%) scale(${fit.scale})` }
        }
      >
        <section className="pt-shell" aria-labelledby="pt-page-title">
          <header className="pt-nav">
            <div className="pt-brand" aria-label="Passport home">
              <span className="pt-brand-mark" aria-hidden="true" />
              <span>Passport</span>
            </div>
            <nav className="pt-nav-links" aria-label="Primary navigation">
              <Link href="/dashboard">Console</Link>
              <span aria-hidden="true">·</span>
              <Link href="/documentation">Docs</Link>
            </nav>
          </header>

          <div className="pt-intro">
            <h1 id="pt-page-title">
              <span className="pt-headline-sans">Zero-trust control for</span>
              <span className="pt-headline-serif">autonomous agents.</span>
            </h1>
            <p>
              The control plane between agents and their tools — delegate scoped passes,
              <br className="pt-desktop-break" /> enforce policy in under a millisecond, and
              prove every decision.
            </p>
          </div>

          <section className="pt-cards" aria-label="Passport trust layer">
            <IdentityCard {...identity} />
            <PolicyKernelCard {...policy} />
            <AccountabilityCard {...accountability} />
          </section>
        </section>
      </div>
    </div>
  );
}
```

### 1.10 `frontend/src/components/trust-triptych/index.ts`

_Barrel export._

```ts
export { AccountabilityCard } from "./AccountabilityCard";
export type {
  AccountabilityCardProps,
  AuditChainSummary,
  PendingApprovalSummary,
} from "./AccountabilityCard";
export { IdentityCard } from "./IdentityCard";
export type { IdentityCardProps } from "./IdentityCard";
export { PolicyKernelCard } from "./PolicyKernelCard";
export type { PolicyKernelCardProps } from "./PolicyKernelCard";
export { ScaledStage } from "./ScaledStage";
export type { ScaledStageProps } from "./ScaledStage";
export { TrustHero } from "./TrustHero";
export type { TrustHeroProps } from "./TrustHero";
export { TrustTriptych } from "./TrustTriptych";
export type { TrustTriptychProps } from "./TrustTriptych";
export {
  DEFAULT_TELEMETRY_BASELINE,
  DEFAULT_TELEMETRY_FRAMES,
  formatCount,
  formatUsd,
  shortFingerprint,
} from "./data";
export type { TelemetryFrame } from "./data";
```

---

## PHASE 2 — Target file paths

Create exactly these ten files; touch nothing else in this phase.

```text
frontend/src/components/trust-triptych/
├── trust-triptych.css        # all visuals, imported by the components that need it
├── data.ts                   # TelemetryFrame type, defaults, formatters
├── useStageFit.ts            # useViewportContain (hero) + useContainerFit (embeds)
├── ScaledStage.tsx           # client: scales a fixed composition to its container
├── IdentityCard.tsx          # card 1
├── PolicyKernelCard.tsx      # client: card 2 (hover telemetry scramble)
├── AccountabilityCard.tsx    # card 3
├── TrustTriptych.tsx         # 1344×586 strip of all three, scaled; for app pages
├── TrustHero.tsx             # client: full-bleed 1690×950 hero; for the landing route
└── index.ts                  # barrel: import everything from "@/components/trust-triptych"
```

Notes on behaviour you must preserve:

- **Hero** (`TrustHero`): the 1690×950 canvas is uniformly scaled with `Math.min` (contain, never cover) at 700px and wider, so nothing is ever cropped at any aspect ratio. Below 700px it reflows into one stacked column.
- **Embedded strip** (`TrustTriptych`): scales to its container, never above 1×, and stacks below **880px** of container width (a deliberate choice for the app shell: at 700px the strip would scale to about 0.52× and the text would be illegible). The hero keeps the reference's 700px.
- **Solo cards** are wrapped in `<ScaledStage designWidth={440} designHeight={586}>` (see Phase 3).
- Hover states: card 1's surface swells vertically and saturates; card 2's three numbers cycle every 105ms (stopped by `prefers-reduced-motion`, blur, pointer-leave and tab-hidden); card 3's strip expands to fill the card while the bloom drifts. All three also trigger on keyboard focus.

---

## PHASE 3 — Integration points

### 3.1 `/dashboard` — `frontend/src/app/dashboard/page.tsx`
Insert the full strip as the **first element of the page content**, above the existing metric grid. Keep everything already on the page.

```tsx
import { TrustTriptych } from "@/components/trust-triptych";

// …inside the page's returned JSX, before the metrics grid:
<TrustTriptych
  className="mb-8"
  identity={{ agentId: activeAgent.id, fingerprint: activeAgent.keyFingerprint, additionalPasses: activeCount - 1 }}
  policy={{ baseline: { latencyMs: kernelLatencyMs, blockedPct: threatBlockRatePct, callsK: decisionsPerSecK } }}
  accountability={{
    pendingApproval: topPending ? { amountUsd: topPending.requestedAmount } : null,
    chain: { blocks: chainLength, intact: chainVerified },
  }}
/>
```

### 3.2 `/agents` — `frontend/src/app/agents/page.tsx`
Mount **card 1 only** above the Agent Pass grid on mobile and as a right-hand rail at `xl` and up.

```tsx
import { IdentityCard, ScaledStage } from "@/components/trust-triptych";

<div className="w-full max-w-[440px]">
  <ScaledStage designWidth={440} designHeight={586}>
    <IdentityCard
      agentId={newestActive.id}
      fingerprint={newestActive.keyFingerprint}
      additionalPasses={Math.max(activeCount - 1, 0)}
    />
  </ScaledStage>
</div>
```

### 3.3 `/policies` — `frontend/src/app/policies/page.tsx`
Mount **card 2 only** beside or above the guardrail rule cards.

```tsx
import { PolicyKernelCard, ScaledStage } from "@/components/trust-triptych";

<div className="w-full max-w-[440px]">
  <ScaledStage designWidth={440} designHeight={586}>
    <PolicyKernelCard baseline={{ latencyMs: kernelLatencyMs, blockedPct: threatBlockRatePct, callsK: decisionsPerSecK }} />
  </ScaledStage>
</div>
```

### 3.4 `/wallet`, `/approvals` and `/audit`
Mount **card 3 only** at the top of each page, with the same wrapper pattern. On `/approvals` pass the oldest PENDING ticket; on `/audit` the verification result is the important row.

```tsx
import { AccountabilityCard, ScaledStage } from "@/components/trust-triptych";

<div className="w-full max-w-[440px]">
  <ScaledStage designWidth={440} designHeight={586}>
    <AccountabilityCard
      pendingApproval={topPending ? { amountUsd: topPending.requestedAmount } : null}
      chain={{ blocks: chainLength, intact: chainVerified }}
    />
  </ScaledStage>
</div>
```

### 3.5 Public landing hero — `frontend/src/app/page.tsx`
Render the cinematic hero on the public landing route.

```tsx
import { TrustHero } from "@/components/trust-triptych";

export default function LandingPage() {
  return <TrustHero />;
}
```
- If `/` currently redirects to `/dashboard` or hosts the app, **do not break that**; create `frontend/src/app/showcase/page.tsx` with the snippet above instead.
- `TrustHero` is `position: fixed; inset: 0; z-index: 40`, so it covers any persistent sidebar or header. That is intended, and the hero's own nav links to `/dashboard` (Console) and `/documentation` (Docs).

### 3.6 Data binding (use existing fetchers, do not invent endpoints)

| Prop | Source in the existing app |
|---|---|
| `identity.agentId`, `fingerprint` | Most recently minted `AgentRecord` with `status === "ACTIVE"` (`id`, `keyFingerprint`) |
| `identity.additionalPasses` | Count of `ACTIVE` agents minus 1 |
| `policy.baseline.latencyMs` | Policy-engine average evaluation latency in ms (default `"0.082"`), as a string |
| `policy.baseline.blockedPct` | Threat block rate as a percentage string (default `"98.4"`) |
| `policy.baseline.callsK` | Tool-call decisions per second ÷ 1000 as a string (default `"128"`) |
| `accountability.pendingApproval` | First `ApprovalRequest` with `status === "PENDING"` → `{ amountUsd: requestedAmount }`, otherwise `null` |
| `accountability.chain` | Latest hash-chain verification: `{ blocks: <chain length>, intact: <tamperVerified> }` |

If a value is not available on a given page, omit that prop and let the default render. The hover scramble frames (`frames`) are decorative; leave them at the default.

---

## PHASE 4 — Build & verification checklist

Run each step and fix failures before moving on. Report the result of every step.

**A. Static checks** (from `frontend/`)
- [ ] `npx tsc --noEmit` passes with zero errors (strict mode; no `any`).
- [ ] `npm run lint` passes.
- [ ] `npm run build` completes for all routes (Next.js 16 / React 19).
- [ ] Forbidden-term sweep returns nothing: `grep -rniE "vela|bitcoin|ethereum|btc|apy|us-east|eu-west|planetary|streaming" src/components/trust-triptych`

**B. Visual and responsive inspection** (`npm run dev`)
- [ ] **Hero at 1920×1080, 1440×900, 1024×768, 2560×1080 and 700×900:** all three cards sit side by side, nothing is cropped, there is no scrollbar, and the letterbox is invisible (everything shares `#05070d`).
- [ ] **Hero at 699px, 390×844 and 320×640:** single stacked column, no horizontal scroll, orbit ring and sphere stay inside their card and stay circular, card-1 title wraps inside the card.
- [ ] **`/dashboard` strip** at 1440px, 1024px, 900px and 879px: scales fluidly down to 880px and stacks at 879px and below.
- [ ] **Solo cards** on `/agents`, `/policies`, `/wallet`, `/approvals`, `/audit` render at up to 440px wide and scale down on narrow screens; they are not clipped by their parent.
- [ ] **Hover and keyboard focus (Tab):** card 1 surface swells and saturates; card 2 numbers cycle at about 105ms and snap back to the live values on leave or blur; card 3 strip expands to full height, the green/blue/amber bloom drifts, and the static strip fades.
- [ ] **Reduced motion** (OS setting on): orbit and dots stop, telemetry does not scramble, transitions are effectively instant.
- [ ] **Pill and text overlap check:** no pills overlap each other at any width, and the card-3 rows do not truncate `Spend $28.50 held for approval`.
- [ ] No hydration warnings in the browser console.

**C. Commit**
```bash
git add frontend/src/components/trust-triptych frontend/src/app
git commit -m "feat(ui): Passport trust triptych hero and cards (identity, policy kernel, accountability)"
git push
```

**D. Deploy** (from the repository root; existing service settings and env vars are preserved on update)
```bash
gcloud run deploy passport-trust-frontend --source ./frontend --region asia-south1
```
- [ ] After deploy, open `https://passport-trust-frontend-58223756937.asia-south1.run.app` and repeat the B-checks on `/dashboard` and the hero route against the live URL.
- [ ] Confirm the backend gateway (`https://passport-trust-gateway-58223756937.asia-south1.run.app`) still responds and the live props on the dashboard are populated from it.

When finished, reply with: the list of files created or modified, the outcome of each checklist item, the deployed revision URL, and any deviation from this prompt with the reason.
