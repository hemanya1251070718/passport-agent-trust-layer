"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import MintPassModal from "./buy-form";
import SimulateErrandModal from "./sell-form";
import CardSlider from "./slider";
import { useState } from "react";
import BrandLogo from "../BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Shield, KeyRound, Play, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

const Hero = () => {
  const [isMinting, setIsMintingOpen] = useState(false);
  const [isSimulating, setIsSimulatingOpen] = useState(false);

  const leftAnimation = {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
    transition: { duration: 0.6 },
  };

  const rightAnimation = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <section
      className="relative py-24 pt-48 overflow-hidden z-1"
      id="main-banner"
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div {...leftAnimation} className="flex flex-col items-center lg:items-start gap-8">
            <div className="flex flex-col gap-4 text-center lg:text-left">
              <div className="flex gap-3 items-center lg:justify-start justify-center flex-wrap">
                <Badge
                  variant="outline"
                  className="text-sm py-1 px-3 bg-primary/10 rounded-full border border-primary/30 text-primary font-medium flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" /> Zero-Trust Agent Governance
                </Badge>
                <Badge
                  variant="outline"
                  className="text-sm py-1 px-3 bg-white/5 rounded-full border border-white/10 text-white/80 font-mono"
                >
                  Homingo Hack Days 2026
                </Badge>
              </div>

              <h1 className="font-bold xl:text-[68px] md:text-5xl sm:text-4xl text-3xl text-white tracking-tight leading-tight">
                Software Built for <span className="text-primary">Autonomous Agents</span>
              </h1>

              <p className="text-white/80 text-lg leading-relaxed">
                The zero-trust control plane for agent swarms: Ed25519 identity delegation,
                sub-millisecond policy interception, sandboxed treasury limits, and SHA-256
                verifiable audit flight recorder.
              </p>
            </div>

            <div className="flex flex-wrap items-center md:justify-start justify-center gap-4">
              <Button
                render={<Link href="/dashboard" />}
                className="text-base bg-primary hover:bg-primary/90 text-black font-semibold py-6 px-7 rounded-lg h-12 flex items-center gap-2"
              >
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                render={<Link href="/demo" />}
                variant="outline"
                className="text-base border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium py-6 px-6 rounded-lg h-12"
              >
                Deterministic Demo
              </Button>

              <Button
                variant="ghost"
                onClick={() => setIsMintingOpen(true)}
                className="text-sm text-primary hover:text-primary hover:bg-primary/10 h-12 flex items-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" /> Mint Pass
              </Button>

              <Button
                variant="ghost"
                onClick={() => setIsSimulatingOpen(true)}
                className="text-sm text-white/70 hover:text-white hover:bg-white/10 h-12 flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Test Guardrail
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10 w-full text-center lg:text-left">
              <div>
                <p className="text-2xl font-bold text-primary font-mono">100%</p>
                <p className="text-xs text-white/60">Hostile Vectors Blocked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-mono">0.102 ms</p>
                <p className="text-xs text-white/60">Decision Latency (p50)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400 font-mono">0%</p>
                <p className="text-xs text-white/60">False Positive Rate</p>
              </div>
            </div>
          </motion.div>

          <motion.div {...rightAnimation} className="w-full">
            {/* Interactive Holographic Agent Pass Card */}
            <div className="w-full max-w-lg mx-auto bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/15 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/30">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Passport Agent Pass</h3>
                    <p className="text-xs text-white/60 font-mono">ID: agent_errand_01</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE & ENFORCING
                </Badge>
              </div>

              {/* Identity & Scope Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-white/10 text-xs font-mono">
                <div>
                  <span className="text-white/40 block">Principal</span>
                  <span className="text-white/90">hemanya1251070718</span>
                </div>
                <div>
                  <span className="text-white/40 block">Delegation Key</span>
                  <span className="text-primary truncate block">ed25519:7f8a9b2c...4d</span>
                </div>
                <div>
                  <span className="text-white/40 block">Per-Tx Spend Cap</span>
                  <span className="text-white/90">$15.00 USD</span>
                </div>
                <div>
                  <span className="text-white/40 block">24h Velocity Cap</span>
                  <span className="text-white/90">$50.00 USD ($41.50 remaining)</span>
                </div>
              </div>

              {/* Authorized Scopes */}
              <div className="py-3 border-b border-white/10">
                <span className="text-xs text-white/40 block mb-2 font-mono">Authorized Capability Scopes</span>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">olostep:scrape</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">crustdata:enrich</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">wallet:spend</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 line-through border border-red-500/20">system:exec</span>
                </div>
              </div>

              {/* Intercepted Threats Preview */}
              <div className="pt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-white/80">Hostile Vectors Intercepted:</span>
                </div>
                <span className="font-mono font-bold text-primary">49 / 49 (100%)</span>
              </div>
            </div>
          </motion.div>
        </div>

        <BrandLogo />
        <CardSlider />
      </div>

      {/* Dialog for Mint Pass */}
      <Dialog open={isMinting} onOpenChange={setIsMintingOpen}>
        <DialogContent className="max-w-md bg-dark_grey/95 backdrop-blur-md border border-border p-6 text-center">
          <MintPassModal />
        </DialogContent>
      </Dialog>

      {/* Dialog for Test Guardrail */}
      <Dialog open={isSimulating} onOpenChange={setIsSimulatingOpen}>
        <DialogContent className="max-w-md bg-dark_grey/95 backdrop-blur-md border border-border p-6 text-center">
          <SimulateErrandModal />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hero;
