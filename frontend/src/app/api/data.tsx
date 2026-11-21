export const footerlabels: { label: string; herf: string }[] = [
  { label: "Documentation", herf: "/documentation" },
  { label: "Dashboard", herf: "/dashboard" },
  { label: "Trust Report", herf: "/trust-report" },
  { label: "GitHub Repository", herf: "https://github.com/hemanya1251070718/passport-agent-trust-layer" },
];

export const pricedata: {
  title: string;
  short: string;
  icon: string;
  background: string;
  price: string;
  mark: string;
  width: number;
  height: number;
  padding: string;
}[] = [
  {
    title: "Ed25519 Delegation",
    short: "RFC 8037 JWT",
    icon: "/images/icons/icon-key.svg",
    background: "bg-chart-5/20",
    price: "0.102 ms",
    mark: "100% Verified",
    width: 24,
    height: 24,
    padding: "px-4 py-3",
  },
  {
    title: "Policy Interceptor",
    short: "Default-Deny",
    icon: "/images/icons/icon-shield.svg",
    background: "bg-secondary/15",
    price: "49 Blocked",
    mark: "0% False Positives",
    width: 24,
    height: 24,
    padding: "px-4 py-2",
  },
  {
    title: "Virtual Treasury",
    short: "Spend Velocity",
    icon: "/images/icons/icon-lock.svg",
    background: "bg-secondary/15",
    price: "$15.00 / tx",
    mark: "$50.00 / 24h cap",
    width: 24,
    height: 24,
    padding: "px-4 py-3",
  },
  {
    title: "Audit Ledger",
    short: "SHA-256 Chain",
    icon: "/images/icons/icon-ledger.svg",
    background: "bg-secondary/15",
    price: "100% Chain",
    mark: "Tamper Evident",
    width: 24,
    height: 24,
    padding: "px-4 py-3",
  },
  {
    title: "Olostep Shield",
    short: "Web Scraper Guard",
    icon: "/images/icons/icon-terminal.svg",
    background: "bg-secondary/15",
    price: "11 Attacks",
    mark: "Injection Filtered",
    width: 24,
    height: 24,
    padding: "px-4 py-3",
  },
  {
    title: "Crustdata Gateway",
    short: "B2B MCP Relay",
    icon: "/images/icons/icon-terminal.svg",
    background: "bg-chart-5/20",
    price: "0 PII Leaks",
    mark: "Company-Level Only",
    width: 24,
    height: 24,
    padding: "px-4 py-3",
  },
];

export const portfolioData: { image: string; title: string }[] = [
  {
    image: "/images/portfolio/portfolio-icon-1.svg",
    title: "Cryptographic Delegation & Identity Passes",
  },
  {
    image: "/images/portfolio/portfolio-icon-2.svg",
    title: "Sub-Millisecond Policy & SSRF Interception",
  },
  {
    image: "/images/portfolio/portfolio-icon-3.svg",
    title: "Sandboxed Spend Velocity & Multi-Currency Treasury",
  },
  {
    image: "/images/portfolio/portfolio-icon-1.svg",
    title: "SHA-256 Merkle Chained Flight Recorder",
  },
];

export const upgradeData: { title: string }[] = [
  { title: "100% Hostile Vector Interception" },
  { title: "0% False Positive Rate on Legitimate Errands" },
  { title: "0.102 ms p50 Decision Latency" },
  { title: "RFC 8037 Ed25519 JWKS Cryptographic Identity" },
  { title: "Live Emergency Kill Switch per Agent" },
  { title: "Ephemeral Virtual Card Spending Caps" },
  { title: "Model Context Protocol (MCP) Guard Gateway" },
  { title: "SHA-256 Verifiable Audit Flight Recorder" },
];

export const perksData: {
  icon: string;
  title: string;
  text: string;
  space: string;
}[] = [
  {
    icon: "/images/perks/peak-icon-1.svg",
    title: "Sub-Millisecond Engine",
    text: "Sub-millisecond policy engine validates tool parameters and context before execution.",
    space: "lg:mt-8",
  },
  {
    icon: "/images/perks/peak-icon-2.svg",
    title: "Human-in-the-Loop",
    text: "High-risk tool invocations generate real-time approval tickets with instant Webhook alerts.",
    space: "lg:mt-14",
  },
  {
    icon: "/images/perks/peak-icon-3.svg",
    title: "Immutable Flight Recorder",
    text: "Every decision and spend is SHA-256 hash-chained for instant cryptographic compliance audit.",
    space: "lg:mt-4",
  },
];

export const timelineData: {
  icon: string;
  title: string;
  text: string;
  position: string;
}[] = [
  {
    icon: "/images/solution/solution-icon-1.svg",
    title: "1. Delegation Mint",
    text: "Principal issues scoped Ed25519 delegation pass with TTL and spending limits",
    position: "md:top-0 md:left-0",
  },
  {
    icon: "/images/solution/solution-icon-2.svg",
    title: "2. Policy Intercept",
    text: "Tool calls evaluated against regex rules, IP allowlists, and prompt injection filters",
    position: "md:top-0 md:right-0",
  },
  {
    icon: "/images/solution/solution-icon-3.svg",
    title: "3. Sandboxed Spend",
    text: "Virtual card transactions strictly capped to authorized merchant domains",
    position: "md:bottom-0 md:left-0",
  },
  {
    icon: "/images/solution/solution-icon-4.svg",
    title: "4. Hash-Chained Audit",
    text: "All actions permanently recorded in SHA-256 verifiable flight recorder",
    position: "md:bottom-0 md:right-0",
  },
];

export const CryptoData: { name: string; price: number }[] = [
  { name: "agent_errand_01 (Standard Errand)", price: 15.00 },
  { name: "agent_researcher_02 (Read-Only)", price: 5.00 },
  { name: "agent_analyst_03 (Enrichment)", price: 25.00 },
  { name: "agent_swarm_coordinator (Supervisor)", price: 50.00 },
];
