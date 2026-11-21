import React from "react";
import { CheckCircle2, ShieldCheck, Zap, KeyRound, Lock, Terminal, ShieldAlert, FileCheck2, Cpu } from "lucide-react";
import { AdversarialShieldMockup } from "./adversarial-shield-mockup";

const enterpriseFeatures = [
  {
    title: "MCP Guard Gateway",
    description: "Validate tool calls across Model Context Protocol servers in real time.",
  },
  {
    title: "Emergency Kill Switch",
    description: "Instantly freeze any rogue agent and revoke credentials with a single API call.",
  },
  {
    title: "Sub-Millisecond Policy SLA",
    description: "Average 0.082ms verification overhead with zero delay on approved tasks.",
  },
  {
    title: "RFC 8037 Ed25519 Identity",
    description: "Cryptographically verifiable capability tokens verified against public JWKS.",
  },
  {
    title: "Zero False Positives",
    description: "High-precision filters ensure legitimate research and errands are never blocked.",
  },
  {
    title: "Virtual Card Spending Caps",
    description: "Hard dollar ceilings per task and per day enforced directly at settlement.",
  },
  {
    title: "Prompt Injection Defense",
    description: "Neutralize indirect prompt injections in scraped data and API responses.",
  },
  {
    title: "SOC 2 Audit Packages",
    description: "Download signed, tamper-evident audit logs ready for external compliance auditors.",
  },
];

const Upgrade = () => {
  return (
    <section className="py-24" id="upgrade">
      <div className="container mx-auto px-4 lg:max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Enterprise Security Features */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4" /> Hardened Enterprise Defense
            </div>
            <h2 className="text-white sm:text-5xl text-3xl font-bold mb-4 tracking-tight leading-tight">
              Production Control for Autonomous Agent Swarms
            </h2>
            <p className="text-white/70 text-base sm:text-lg mb-8 leading-relaxed">
              Tested against prompt injections, SSRF payloads, privilege escalation, and runaway billing burn.
              Passport is the battle-tested trust harness for production agent deployments.
            </p>
            <div className="grid sm:grid-cols-2 gap-3.5">
              {enterpriseFeatures.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <h3 className="text-sm text-white font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-xs text-white/60 pl-6 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Adversarial Defense Matrix */}
          <div className="lg:col-span-6 flex justify-center">
            <AdversarialShieldMockup />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Upgrade;
