"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Zap, Lock, Terminal, CheckCircle2 } from "lucide-react";

export const AdversarialShieldMockup: React.FC = () => {
  const attackFeeds = [
    {
      type: "SSRF Probe Detected",
      target: "169.254.169.254/latest/meta-data",
      decision: "BLOCKED",
      decisionColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      latency: "0.041 ms",
    },
    {
      type: "Indirect Prompt Injection",
      target: "Scraped text contains prompt override attempt",
      decision: "QUARANTINED",
      decisionColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      latency: "0.095 ms",
    },
    {
      type: "Spend Velocity Violation",
      target: "$250.00 charge exceeds single-tx limit",
      decision: "INTERCEPTED",
      decisionColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      latency: "0.052 ms",
    },
    {
      type: "Legitimate Errand Execution",
      target: 'olostep.scrape("homingo.com/pricing")',
      decision: "APPROVED",
      decisionColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      latency: "0.082 ms",
    },
  ];

  return (
    <div className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.12)] backdrop-blur-xl select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-semibold text-white">Live Attack Mitigation Stream</h4>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
          Zero Breaches
        </span>
      </div>

      {/* Grid: 100% Interception Gauge + Live Feed */}
      <div className="grid sm:grid-cols-12 gap-5 py-5 items-center">
        {/* Left: Circular Interception Gauge */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-zinc-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-emerald-400"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-mono text-white">100%</span>
              <span className="text-[10px] uppercase font-semibold text-emerald-400">Shielded</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-white mt-3">Interception Rate</span>
          <span className="text-[11px] text-white/50">49 of 49 attacks blocked</span>
        </div>

        {/* Right: Live Mitigation Feed */}
        <div className="sm:col-span-7 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-white/50 block mb-1 font-medium">Real-Time Defense Log</span>
          {attackFeeds.map((feed, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2"
            >
              <div className="truncate">
                <span className="text-xs font-semibold text-white/90 block truncate">
                  {feed.type}
                </span>
                <span className="text-[10px] text-white/50 truncate block mt-0.5">
                  {feed.target}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${feed.decisionColor}`}>
                  {feed.decision}
                </span>
                <span className="text-[10px] text-white/40 block mt-1 font-mono">
                  {feed.latency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom KPI Bar */}
      <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-white/[0.02]">
          <span className="text-white/40 block text-[10px] font-medium uppercase mb-0.5">p50 Latency</span>
          <span className="text-emerald-400 font-bold font-mono">0.082 ms</span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.02]">
          <span className="text-white/40 block text-[10px] font-medium uppercase mb-0.5">False Positive</span>
          <span className="text-cyan-400 font-bold font-mono">0.00%</span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.02]">
          <span className="text-white/40 block text-[10px] font-medium uppercase mb-0.5">Key Protocol</span>
          <span className="text-purple-400 font-bold font-mono">Ed25519</span>
        </div>
      </div>
    </div>
  );
};
