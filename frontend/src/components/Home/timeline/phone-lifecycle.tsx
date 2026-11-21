"use client";

import React from "react";
import { ShieldCheck, KeyRound, Lock, DollarSign, Terminal, ShieldAlert } from "lucide-react";

export const SecurityLifecyclePhoneMockup: React.FC = () => {
  return (
    <div className="relative mx-auto flex items-center justify-center py-2 select-none">
      {/* Concentric ambient halos - properly contained */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[360px] h-[360px] rounded-full border border-primary/15 animate-[spin_80s_linear_infinite]" />
        <div className="w-[290px] h-[290px] rounded-full border border-cyan-500/10" />
      </div>

      {/* Phone Hardware Chassis */}
      <div className="relative w-[295px] sm:w-[315px] rounded-[44px] bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(6,182,212,0.15)] border border-white/20">
        {/* Screen Frame */}
        <div className="relative overflow-hidden rounded-[36px] bg-zinc-950 border border-white/10 p-4 text-white">
          {/* Dynamic Island */}
          <div className="mx-auto mb-3.5 flex h-6 w-32 items-center justify-between rounded-full bg-black px-3 border border-white/15 shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[9px] font-sans font-semibold tracking-wider text-emerald-400">PASSPORT ACTIVE</span>
            <div className="h-2 w-2 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] text-white/50 block font-medium">Session Monitor</span>
              <span className="text-sm font-semibold text-white">Errand Agent #01</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-mono border border-primary/30">
              Pass #8921
            </span>
          </div>

          {/* 4 Security Lifecycle Stages */}
          <div className="space-y-2 py-3">
            {/* Stage 1: Delegation */}
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-white/90 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> 1. Access Pass
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-medium">VERIFIED</span>
              </div>
              <p className="text-[11px] text-white/60">
                Ed25519 signed · 1hr TTL · Scoped
              </p>
            </div>

            {/* Stage 2: Intercept */}
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-white/90 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> 2. Policy Guard
                </span>
                <span className="text-[10px] font-mono text-cyan-300">0.082ms</span>
              </div>
              <p className="text-[11px] text-white/60">
                olostep.scrape · homingo.com (ALLOW)
              </p>
            </div>

            {/* Stage 3: Sandboxed Spend */}
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-white/90 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> 3. Treasury Card
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">$8.50 SETTLED</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full w-[56%]" />
              </div>
              <p className="text-[10px] text-white/50 mt-1">
                $8.50 spent of $15.00 single-task cap
              </p>
            </div>

            {/* Stage 4: Flight Recorder */}
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-white/90 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" /> 4. Audit Ledger
                </span>
                <span className="text-[10px] font-mono text-purple-300">BLOCK #1,048</span>
              </div>
              <p className="text-[11px] text-white/60">
                SHA-256 hash chained to master log
              </p>
            </div>
          </div>

          {/* Intercept Alert Banner */}
          <div className="mt-1 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="text-[10px]">
              <span className="text-rose-400 font-semibold block">SSRF Attack Blocked</span>
              <span className="text-rose-300/80">169.254.169.254 denied in 0.04ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
