"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Zap, AlertCircle, ArrowUpRight, Activity } from "lucide-react";

export const SwarmTelemetryMockup: React.FC = () => {
  const agents = [
    {
      id: "agent_errand_01",
      role: "Standard Errand Runner",
      status: "ALLOWED",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      latency: "0.082 ms",
      scope: 'olostep.scrape("homingo.com")',
      spend: "$8.50 / $15.00",
      spendPct: "56%",
      pass: "Pass #8921",
    },
    {
      id: "agent_analyst_03",
      role: "B2B Market Enrichment",
      status: "ALLOWED",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      latency: "0.104 ms",
      scope: 'crustdata.enrich_company("acme")',
      spend: "$18.20 / $25.00",
      spendPct: "72%",
      pass: "Pass #8919",
    },
    {
      id: "agent_rogue_09",
      role: "Adversarial Probe Simulator",
      status: "BLOCKED (SSRF)",
      statusColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      latency: "0.041 ms",
      scope: "aws.metadata (169.254.169.254)",
      spend: "$0.00 / $10.00",
      spendPct: "0%",
      pass: "Emergency Kill",
    },
    {
      id: "agent_procure_02",
      role: "Virtual Card Settler",
      status: "APPROVAL PENDING",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      latency: "Held",
      scope: "spend:high_velocity ($48.50)",
      spendPct: "97%",
      spend: "$48.50 / $50.00",
      pass: "Ticket #182",
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-black p-5 sm:p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.1)] backdrop-blur-xl select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Active Swarm Trust Telemetry</h4>
            <p className="text-[11px] font-mono text-white/50">4 Autonomous Agents Bound by Scoped Passes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            FLEET SAFETY 99.8%
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 py-4 border-b border-white/10 text-center">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-[10px] font-mono uppercase text-white/50 block">Interceptions</span>
          <span className="text-base font-bold font-mono text-cyan-400">49 Blocked</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-[10px] font-mono uppercase text-white/50 block">p50 Latency</span>
          <span className="text-base font-bold font-mono text-emerald-400">0.082 ms</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-[10px] font-mono uppercase text-white/50 block">Treasury Spend</span>
          <span className="text-base font-bold font-mono text-purple-400">$75.20 / $200</span>
        </div>
      </div>

      {/* Live Agent Fleet Status */}
      <div className="space-y-3 pt-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-white">{agent.id}</span>
                <span className="hidden sm:inline-block text-[10px] text-white/50">({agent.role})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${agent.statusColor}`}>
                  {agent.status}
                </span>
                <span className="text-[10px] font-mono text-cyan-300 hidden sm:inline-block">
                  {agent.latency}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-white/60 mb-1.5">
              <span className="truncate max-w-[220px]">{agent.scope}</span>
              <span className="shrink-0">{agent.spend}</span>
            </div>

            {/* Spend Velocity Progress Bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  agent.status.includes("BLOCKED")
                    ? "bg-rose-500"
                    : agent.status.includes("PENDING")
                    ? "bg-amber-400"
                    : "bg-gradient-to-r from-cyan-500 to-emerald-400"
                }`}
                style={{ width: agent.spendPct }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Sparkline & Throughput */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/60">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Decision Throughput: 1,420 checks/s</span>
        </div>
        <span className="text-emerald-400 font-bold">0 False Positives</span>
      </div>
    </div>
  );
};
