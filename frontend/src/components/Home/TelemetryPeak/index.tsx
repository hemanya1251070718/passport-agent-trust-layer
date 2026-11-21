"use client";
import React, { useState } from "react";
import { PeakChart } from "@/components/ui/peak-chart";
import { ShieldCheck, Activity, DollarSign, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TelemetryPeak() {
  const [period, setPeriod] = useState("Monthly");

  return (
    <section className="py-20 relative overflow-hidden z-1 bg-background/50">
      <div className="container px-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <Badge
            variant="outline"
            className="text-xs py-1 px-3 bg-primary/10 rounded-full border border-primary/30 text-primary font-medium flex items-center gap-1.5 mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" /> High-Performance Swarm Telemetry
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Cryptographic Assurance at <span className="text-primary">Sub-Millisecond Scale</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg mt-3 leading-relaxed">
            Real-time policy evaluation, tamper-evident hash chaining, and treasury velocity tracking displayed live through our interactive telemetry visualizer.
          </p>
        </div>

        {/* Dual Peak Chart Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-items-center">
          {/* Chart 1: Threat Interception Efficacy */}
          <div className="w-full p-8 rounded-3xl bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent border border-white/10 flex flex-col items-center justify-center backdrop-blur-xl relative group hover:border-primary/40 transition-all duration-300">
            <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Threat Interception Efficacy</h3>
                  <p className="text-xs text-white/50 font-mono">100% Hostile Vectors Blocked</p>
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-xs">
                DEFAULT-DENY
              </Badge>
            </div>

            <div className="w-full flex justify-center py-2 overflow-x-auto">
              <PeakChart
                width={380}
                value={100}
                valueSuffix="%"
                title="Defense Rate"
                caption="Adversarial prompt injections, SSRF, & scope traversal stopped"
                accent="#38bdf8"
                updatedText="Live Gate Active"
              />
            </div>
          </div>

          {/* Chart 2: Swarm Treasury Outflow */}
          <div className="w-full p-8 rounded-3xl bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent border border-white/10 flex flex-col items-center justify-center backdrop-blur-xl relative group hover:border-emerald-500/40 transition-all duration-300">
            <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Treasury Velocity Limits</h3>
                  <p className="text-xs text-white/50 font-mono">Real-time Multi-Agent Spend Tracker</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono text-xs">
                HEADROOM: $41.50
              </Badge>
            </div>

            <div className="w-full flex justify-center py-2 overflow-x-auto">
              <PeakChart
                width={380}
                value={41.5}
                valueSuffix=" USD"
                decimals={1}
                title="Remaining Treasury"
                caption="Current 24h spend limit: $50.00 across all agents"
                accent="#10b981"
                period={period}
                onPeriodChange={setPeriod}
                updatedText="Audited in Ledger"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
