"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Activity, 
  Wifi, 
  Battery, 
  Signal, 
  AlertTriangle,
  Flame,
  KeyRound
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HeroPhoneMockup() {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
      className="relative w-full max-w-[400px] mx-auto select-none"
    >
      {/* Outer Cyan / Emerald Glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 via-emerald-500/20 to-transparent rounded-[54px] blur-2xl opacity-70 pointer-events-none" />

      {/* Phone Hardware Chassis */}
      <div className="relative rounded-[48px] border-[6px] border-zinc-700/80 bg-zinc-950 p-3 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
        {/* Inner Phone Screen */}
        <div className="relative rounded-[40px] bg-gradient-to-b from-[#090d16] via-[#0b1220] to-[#080d18] border border-white/10 p-5 overflow-hidden text-white flex flex-col justify-between min-h-[580px]">
          
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          {/* Top Status Bar & Dynamic Island */}
          <div className="relative z-10">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/60 mb-2">
              <span>09:41</span>
              {/* Dynamic Island */}
              <div className="px-3 py-1 bg-black/90 rounded-full border border-white/15 flex items-center gap-1.5 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-white font-medium">PASSPORT SENTINEL</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Agent Header Identity */}
            <div className="flex items-center justify-between pt-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/20 rounded-xl border border-primary/40 text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Errand Agent #01
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] py-0 px-1.5">
                      ACTIVE
                    </Badge>
                  </h4>
                  <p className="text-[10px] text-white/50 font-mono">Ed25519: 7f8a9b2c...4d9e</p>
                </div>
              </div>
            </div>
          </div>

          {/* Central Security Gauge & Velocity Limiter */}
          <div className="relative z-10 py-3 my-auto space-y-3">
            {/* Real-time Spend Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-white/60 flex items-center gap-1 font-mono">
                  <Lock className="w-3.5 h-3.5 text-primary" /> Spend Velocity
                </span>
                <span className="text-emerald-400 font-mono font-bold">$8.50 / $15.00</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-emerald-400 h-2 rounded-full transition-all duration-500" 
                  style={{ width: "56%" }} 
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-white/40 font-mono mt-1.5">
                <span>Remaining: $6.50</span>
                <span>Max Single Tx: $10.00</span>
              </div>
            </div>

            {/* Capability Scopes */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
              <p className="text-[10px] text-white/50 font-mono uppercase mb-2">Granted Scopes</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30">
                  olostep:scrape
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30">
                  crustdata:verify
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  wallet:spend
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 line-through border border-red-500/30">
                  system:exec
                </span>
              </div>
            </div>

            {/* Live Threat Interception Alert */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/20 to-black/40 border border-red-500/30">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="text-[11px] font-bold text-red-300">Prompt Injection Defeated</span>
              </div>
              <p className="text-[10px] text-white/70 leading-snug">
                Adversarial vector intercepted on target URL. Payload neutralized before reaching model execution context.
              </p>
            </div>
          </div>

          {/* Bottom Live Flight Recorder Commits */}
          <div className="relative z-10 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-[10px] font-mono text-white/60 mb-2">
              <span className="flex items-center gap-1 text-primary">
                <Activity className="w-3 h-3 text-primary animate-spin" /> Merkle Ledger: VALID
              </span>
              <span className="text-emerald-400">0.102ms p50</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-[13px] font-mono font-bold text-white">49 / 49</p>
                <p className="text-[9px] text-white/50">Attacks Blocked</p>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-[13px] font-mono font-bold text-emerald-400">100%</p>
                <p className="text-[9px] text-white/50">Audit Non-Repudiation</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
