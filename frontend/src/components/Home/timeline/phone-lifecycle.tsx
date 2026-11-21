"use client";

import React from "react";
import { ShieldCheck, KeyRound, Lock, DollarSign, Terminal, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export const SecurityLifecyclePhoneMockup: React.FC = () => {
  return (
    <div className="relative mx-auto flex items-center justify-center py-6 select-none">
      {/* Concentric radar rings matching the timeline layout */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[520px] h-[520px] rounded-full border border-cyan-500/10 animate-[spin_60s_linear_infinite]" />
        <div className="w-[420px] h-[420px] rounded-full border border-purple-500/15" />
        <div className="w-[320px] h-[320px] rounded-full border border-white/5" />
      </div>

      {/* Outer Floating Badges */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-6 top-1/4 z-20 hidden lg:flex items-center gap-2 p-3 rounded-2xl bg-zinc-950/90 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-xl"
      >
        <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono text-cyan-400 block uppercase">Delegation Pass</span>
          <span className="text-xs font-bold text-white font-mono">Ed25519 Active</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-6 top-1/3 z-20 hidden lg:flex items-center gap-2 p-3 rounded-2xl bg-zinc-950/90 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-xl"
      >
        <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono text-emerald-400 block uppercase">Policy Enforcer</span>
          <span className="text-xs font-bold text-white font-mono">0.082 ms · ALLOW</span>
        </div>
      </motion.div>

      {/* Phone Hardware Chassis */}
      <div className="relative w-[310px] sm:w-[330px] rounded-[48px] bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.15)] border border-white/20">
        {/* Screen Frame */}
        <div className="relative overflow-hidden rounded-[38px] bg-zinc-950 border border-white/10 p-4 text-white">
          {/* Dynamic Island */}
          <div className="mx-auto mb-4 flex h-6 w-32 items-center justify-between rounded-full bg-black px-3 border border-white/10 shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[9px] font-mono font-medium text-emerald-400">GUARD ACTIVE</span>
            <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">Session Monitor</span>
              <span className="text-sm font-bold text-white">agent_errand_01</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-cyan-300 font-mono border border-primary/30">
              Pass #8921
            </span>
          </div>

          {/* 4 Security Lifecycle Stages */}
          <div className="space-y-2.5 py-3.5">
            {/* Stage 1: Delegation */}
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-white/90 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> 1. Delegation
                </span>
                <span className="text-[10px] font-mono text-emerald-400">VERIFIED</span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                ed25519:7a4f…3a5f · TTL 3,412s
              </p>
            </div>

            {/* Stage 2: Intercept */}
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-white/90 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> 2. Intercept
                </span>
                <span className="text-[10px] font-mono text-cyan-300">0.082ms</span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                olostep.scrape · homingo.com (ALLOW)
              </p>
            </div>

            {/* Stage 3: Sandboxed Spend */}
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-white/90 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> 3. Sandboxed Spend
                </span>
                <span className="text-[10px] font-mono text-emerald-400">$8.50 SETTLED</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full w-[17%]" />
              </div>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">
                Daily Cap: $50.00 · Per-Tx Cap: $15.00
              </p>
            </div>

            {/* Stage 4: Flight Recorder */}
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-white/90 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" /> 4. Flight Recorder
                </span>
                <span className="text-[10px] font-mono text-purple-300">BLOCK #1,048</span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">
                SHA-256 Merkle Chain Validated
              </p>
            </div>
          </div>

          {/* Intercept Alert Banner */}
          <div className="mt-1 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="text-[10px] font-mono">
              <span className="text-rose-400 font-bold block">SSRF ATTEMPT NEUTRALIZED</span>
              <span className="text-rose-300/80">169.254.169.254 blocked in 0.04ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
