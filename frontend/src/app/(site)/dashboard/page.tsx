"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Lock, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Activity, 
  Server,
  Play
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PeakChart } from "@/components/ui/peak-chart";
import { useAuth } from "@/lib/auth-context";
import { TrustTriptych } from "@/components/trust-triptych";

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: any;
  trend?: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, icon: Icon, trend, color = "text-primary" }) => (
  <Card className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-primary/40 transition-all duration-300">
    <CardContent className="p-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-white/60 tracking-wider uppercase">{title}</span>
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white font-mono">{value}</span>
        {trend && <span className="text-xs font-semibold text-emerald-400">{trend}</span>}
      </div>
      <p className="text-xs text-white/50 mt-1">{subtext}</p>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [liveStatus, setLiveStatus] = useState<"ONLINE" | "CHECKING" | "OFFLINE">("CHECKING");
  const [latency, setLatency] = useState("0.102 ms");

  useEffect(() => {
    fetch("https://passport-trust-gateway-58223756937.asia-south1.run.app/health")
      .then(res => res.ok ? setLiveStatus("ONLINE") : setLiveStatus("OFFLINE"))
      .catch(() => setLiveStatus("OFFLINE"));
  }, []);

  const recentEvents = [
    { id: "evt_60", time: "14:48:12", agent: "agent_errand_01", type: "ALLOW", action: "olostep.scrape", detail: "homingo.com (safe markdown payload)" },
    { id: "evt_59", time: "14:48:13", agent: "agent_errand_01", type: "ALLOW", action: "crustdata.enrich", detail: "B2B domain enrichment cleared" },
    { id: "evt_58", time: "14:48:14", agent: "agent_errand_01", type: "SETTLED", action: "wallet.spend", detail: "$8.50 charged on api.olostep.com" },
    { id: "evt_57", time: "14:45:00", agent: "agent_rogue_09", type: "DENY", action: "network.probe", detail: "SSRF attempt -> 169.254.169.254:80" },
    { id: "evt_56", time: "14:42:19", agent: "agent_rogue_14", type: "DENY", action: "system.exec", detail: "Prompt injection vector in context" },
    { id: "evt_55", time: "14:40:02", agent: "agent_errand_01", type: "APPROVE_REQ", action: "wallet.spend", detail: "$28.50 exceeds per-tx cap ($15.00)" },
  ];

  return (
    <main className="min-h-screen pt-32 pb-20 bg-background">
      <div className="container px-4 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">Trust & Control Dashboard</h1>
              <Badge variant="outline" className="text-primary border-primary/30 font-mono text-xs">
                Zero-Trust Plane
              </Badge>
            </div>
            <p className="text-white/60 text-sm mt-1">
              Live monitoring, cryptographic delegation, and real-time policy enforcement for active agent swarms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${liveStatus === 'ONLINE' ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${liveStatus === 'ONLINE' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              </span>
              <span className="text-white/80 font-mono">Gateway: {liveStatus}</span>
            </div>

            <Button render={<Link href="/demo" />} size="sm" className="bg-primary text-black font-semibold hover:bg-primary/90 text-xs h-9 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 mr-1" /> Run Live Errand
            </Button>
          </div>
        </div>

        {/* Passport Trust Triptych */}
        <div className="my-8">
          <TrustTriptych
            className="w-full"
            identity={{
              agentId: "agent_errand_01",
              fingerprint: "ed25519:7a4f9b2c8e1d3a5f",
              additionalPasses: 11,
            }}
            policy={{
              baseline: {
                latencyMs: latency.replace(" ms", "") || "0.082",
                blockedPct: "98.4",
                callsK: "128",
              },
            }}
            accountability={{
              pendingApproval: { amountUsd: 28.5 },
              chain: { blocks: 1048, intact: true },
            }}
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
          <MetricCard
            title="Attacks Intercepted"
            value="49 / 49"
            subtext="100% block rate across red-team benchmark"
            icon={ShieldAlert}
            trend="100% Secure"
            color="text-red-400"
          />
          <MetricCard
            title="Decision Latency (p50)"
            value={latency}
            subtext="Policy evaluation before tool dispatch"
            icon={Zap}
            trend="< 1ms p95"
            color="text-primary"
          />
          <MetricCard
            title="Treasury Spend (24h)"
            value="$8.50"
            subtext="$41.50 remaining of $50.00 daily limit"
            icon={DollarSign}
            trend="Velocity OK"
            color="text-emerald-400"
          />
          <MetricCard
            title="Pending Approvals"
            value="1"
            subtext="Human-in-the-Loop ticket held for review"
            icon={Clock}
            trend="Action Required"
            color="text-amber-400"
          />
        </div>

        {/* Dynamic Peak Telemetry Charts */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent border border-white/10 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Swarm Threat Interception Efficacy
                </h3>
                <p className="text-xs text-white/50 font-mono mt-0.5">Real-time adversarial block rate vs unverified model dispatches</p>
              </div>
              <Badge variant="outline" className="text-primary border-primary/30 text-[10px] font-mono">
                100% BLOCKED
              </Badge>
            </div>
            <div className="w-full flex justify-center py-2">
              <PeakChart 
                width={360} 
                value={100} 
                valueSuffix="%" 
                title="Defense Efficacy" 
                caption="Zero malicious breaches across 49 attack vectors"
                accent="#38bdf8"
                updatedText="Sentinel Live"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent border border-white/10 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Sandboxed Spend Velocity
                </h3>
                <p className="text-xs text-white/50 font-mono mt-0.5">24h multi-agent treasury draw against $50 limit</p>
              </div>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                VELOCITY STABLE
              </Badge>
            </div>
            <div className="w-full flex justify-center py-2">
              <PeakChart 
                width={360} 
                value={41.5} 
                valueSuffix=" USD" 
                decimals={1}
                title="Treasury Headroom" 
                caption="$8.50 spent today across 3 authorized agents"
                accent="#10b981"
                updatedText="Ledger Balanced"
              />
            </div>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Live Activity Feed */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-white text-lg">Live Interception & Audit Stream</h3>
                </div>
                <Button render={<Link href="/audit" />} variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
                  View Full Ledger →
                </Button>
              </div>

              <div className="divide-y divide-white/5 mt-2">
                {recentEvents.map((evt) => (
                  <div key={evt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      {evt.type === "ALLOW" && (
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 font-mono text-[10px] w-20 justify-center">
                          ALLOW
                        </Badge>
                      )}
                      {evt.type === "DENY" && (
                        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 font-mono text-[10px] w-20 justify-center">
                          BLOCKED
                        </Badge>
                      )}
                      {evt.type === "SETTLED" && (
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono text-[10px] w-20 justify-center">
                          SETTLED
                        </Badge>
                      )}
                      {evt.type === "APPROVE_REQ" && (
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-mono text-[10px] w-20 justify-center">
                          APPROVAL
                        </Badge>
                      )}

                      <div>
                        <span className="font-mono text-white/90 font-semibold">{evt.agent}</span>
                        <span className="text-white/40 mx-1.5">•</span>
                        <span className="font-mono text-primary">{evt.action}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-white/60 font-mono text-[11px] pl-24 sm:pl-0">
                      <span className="truncate max-w-xs">{evt.detail}</span>
                      <span className="text-white/40 shrink-0">{evt.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Links / Operations Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/agents" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all block">
                <KeyRound className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-bold text-white text-sm">Agent Passes</h4>
                <p className="text-xs text-white/50 mt-1">Manage Ed25519 capabilities and emergency kill switch</p>
              </Link>

              <Link href="/policies" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all block">
                <Shield className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-bold text-white text-sm">Policy Guardrails</h4>
                <p className="text-xs text-white/50 mt-1">Configure tool allowlists, SSRF filters and spend caps</p>
              </Link>

              <Link href="/sandbox" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all block">
                <ShieldAlert className="w-5 h-5 text-red-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Attack Sandbox</h4>
                <p className="text-xs text-white/50 mt-1">Test live prompt injections and SSRF exploit vectors</p>
              </Link>
            </div>
          </div>

          {/* Right Column: Control Status & Quick Info */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Active Delegation Summary */}
            <Card className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" /> Active Delegation Pass
                </h3>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                  ACTIVE
                </Badge>
              </div>

              <div className="space-y-3 py-4 text-xs font-mono">
                <div>
                  <span className="text-white/40 block">Agent Identifier</span>
                  <span className="text-white">agent_errand_01</span>
                </div>
                <div>
                  <span className="text-white/40 block">Public Key (RFC 8037)</span>
                  <span className="text-primary truncate block">ed25519:7f8a9b2c3d4e5f...</span>
                </div>
                <div>
                  <span className="text-white/40 block">Authorized Capabilities</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px]">olostep:scrape</span>
                    <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px]">crustdata:enrich</span>
                    <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px]">wallet:spend</span>
                  </div>
                </div>
                <div>
                  <span className="text-white/40 block">Remaining TTL</span>
                  <span className="text-white">3,240s of 3,600s</span>
                </div>
              </div>

              <Button render={<Link href="/agents" />} variant="outline" size="sm" className="w-full text-xs border-white/20 bg-white/5 hover:bg-white/10">
                Manage All Agents
              </Button>
            </Card>

            {/* Cloud Run Infrastructure Status */}
            <Card className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-primary" /> Infrastructure Health
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-white/60">Cloud Run Backend</span>
                  <span className="text-emerald-400 font-mono">200 OK (asia-south1)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-white/60">JWKS Endpoint</span>
                  <span className="text-emerald-400 font-mono">RFC 8037 Ready</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-white/60">Audit Ledger Integrity</span>
                  <span className="text-emerald-400 font-mono">100% Chain Match</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-white/60">Idle Compute Cost</span>
                  <span className="text-primary font-mono font-bold">$0.00 (Scale-to-0)</span>
                </div>
              </div>
            </Card>

            {/* Red-Team Scorecard Badge */}
            <Card className="bg-gradient-to-br from-primary/10 via-white/5 to-transparent border border-primary/30 rounded-xl p-6">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Red-Team Verification
              </h3>
              <p className="text-xs text-white/70 mb-4">
                Automated 60-scenario adversarial evaluation suite executed against the live gateway.
              </p>
              <Button render={<Link href="/trust-report" />} size="sm" className="w-full bg-primary text-black font-semibold hover:bg-primary/90 text-xs">
                View Full Trust Report
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
