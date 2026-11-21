"use client";

import React from "react";
import { KeyRound, ShieldAlert, Lock, Terminal, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export const DefenseCardsMockup: React.FC = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto py-4 select-none">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Cryptographic Delegation Pass */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-zinc-900/80 border border-cyan-500/30 shadow-[0_10px_30px_rgba(6,182,212,0.15)] backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                RFC 8037 JWKS
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Ed25519 Delegation Pass</h4>
            <p className="text-xs text-white/60 mb-3">
              Scoped capability token with bounded TTL and verified public keys.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 font-mono text-[10px] space-y-1">
            <div className="flex justify-between text-white/50">
              <span>Agent:</span>
              <span className="text-cyan-400">agent_errand_01</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Signature:</span>
              <span className="text-emerald-400 truncate max-w-[110px]">ed25519:7a4f…3a5f</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Sub-Millisecond Policy Interceptor */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,0.15)] backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                0.082 ms Engine
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Policy & SSRF Interceptor</h4>
            <p className="text-xs text-white/60 mb-3">
              Default-deny regex, cloud metadata protection, and prompt injection filters.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 font-mono text-[10px] space-y-1">
            <div className="flex justify-between text-white/50">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">100% Intercept</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>SSRF Filter:</span>
              <span className="text-cyan-400">169.254.169.254 BLOCKED</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Sandboxed Spend Treasury */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-zinc-900/80 border border-purple-500/30 shadow-[0_10px_30px_rgba(168,85,247,0.15)] backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Virtual Treasury
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Sandboxed Spend Velocity</h4>
            <p className="text-xs text-white/60 mb-3">
              Per-transaction and 24-hour limits on ephemeral virtual cards.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 font-mono text-[10px] space-y-1">
            <div className="flex justify-between text-white/50">
              <span>Card:</span>
              <span className="text-white">•••• 4821 (Exp 12/26)</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Enforced Cap:</span>
              <span className="text-purple-400">$15.00 max / tx</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4: SHA-256 Flight Recorder */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-zinc-900/80 border border-amber-500/30 shadow-[0_10px_30px_rgba(245,158,11,0.15)] backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Terminal className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Merkle Ledger
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">SHA-256 Flight Recorder</h4>
            <p className="text-xs text-white/60 mb-3">
              Immutable hash-chained audit blocks for non-repudiation.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 font-mono text-[10px] space-y-1">
            <div className="flex justify-between text-white/50">
              <span>Integrity:</span>
              <span className="text-emerald-400 font-bold">1,048/1,048 Valid</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Tamper Check:</span>
              <span className="text-amber-400">0 Anomalies</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
