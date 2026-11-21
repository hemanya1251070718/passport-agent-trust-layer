"use client";
import React, { useState } from "react";
import { 
  KeyRound, 
  Shield, 
  ShieldAlert, 
  Plus, 
  PowerOff, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Lock,
  Copy,
  Terminal,
  AlertOctagon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { IdentityCard, ScaledStage } from "@/components/trust-triptych";

interface AgentRecord {
  id: string;
  name: string;
  role: string;
  status: "ACTIVE" | "REVOKED" | "STANDBY";
  keyFingerprint: string;
  scopes: string[];
  budgetLimit: number;
  perTxLimit: number;
  spentAmount: number;
  ttlRemaining: string;
  token?: string;
}

const INITIAL_AGENTS: AgentRecord[] = [
  {
    id: "agent_errand_01",
    name: "Autonomous Errand Runner",
    role: "Scraping & Lead Enrichment",
    status: "ACTIVE",
    keyFingerprint: "ed25519:7f8a9b2c3d4e5f6a",
    scopes: ["olostep:scrape", "crustdata:enrich", "wallet:spend"],
    budgetLimit: 25.00,
    perTxLimit: 15.00,
    spentAmount: 8.50,
    ttlRemaining: "3,240s",
    token: "eyJhbGciOiJFZERTQSI...agent_errand_01_token"
  },
  {
    id: "agent_researcher_02",
    name: "Market Intelligence Bot",
    role: "Web Research (Read-Only)",
    status: "ACTIVE",
    keyFingerprint: "ed25519:1b2c3d4e5f6a7b8c",
    scopes: ["olostep:scrape"],
    budgetLimit: 10.00,
    perTxLimit: 5.00,
    spentAmount: 2.10,
    ttlRemaining: "1,850s",
    token: "eyJhbGciOiJFZERTQSI...agent_researcher_02_token"
  },
  {
    id: "agent_rogue_09",
    name: "Untrusted Sub-Agent",
    role: "Adversarial Test Vector",
    status: "REVOKED",
    keyFingerprint: "ed25519:99a8b7c6d5e4f3a2",
    scopes: ["system:exec"],
    budgetLimit: 0.00,
    perTxLimit: 0.00,
    spentAmount: 0.00,
    ttlRemaining: "REVOKED",
    token: "REVOKED"
  }
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentRecord[]>(INITIAL_AGENTS);
  const [isMintOpen, setIsMintOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);

  // Mint Form State
  const [newAgentId, setNewAgentId] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newScopes, setNewScopes] = useState("olostep:scrape, crustdata:enrich");
  const [newBudget, setNewBudget] = useState("20.00");
  const [newPerTx, setNewPerTx] = useState("10.00");

  const handleKillSwitch = (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        return { ...a, status: "REVOKED", ttlRemaining: "REVOKED" };
      }
      return a;
    }));
    toast.error(`EMERGENCY KILL SWITCH ACTIVATED: ${agentId} revoked immediately!`);
  };

  const handleGlobalKillSwitch = () => {
    setAgents(prev => prev.map(a => ({ ...a, status: "REVOKED", ttlRemaining: "REVOKED" })));
    toast.error("GLOBAL KILL SWITCH ACTIVATED: All active agent delegations halted!");
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newAgentId.trim() || `agent_${Math.random().toString(36).substring(7)}`;
    const newAgent: AgentRecord = {
      id,
      name: newRole || "Custom Errand Agent",
      role: newRole || "Autonomous Task Execution",
      status: "ACTIVE",
      keyFingerprint: `ed25519:${Math.random().toString(16).substring(2, 18)}`,
      scopes: newScopes.split(",").map(s => s.trim()),
      budgetLimit: parseFloat(newBudget) || 20,
      perTxLimit: parseFloat(newPerTx) || 10,
      spentAmount: 0.00,
      ttlRemaining: "3,600s",
      token: `eyJhbGciOiJFZERTQSI...token_${id}`
    };
    setAgents([newAgent, ...agents]);
    setIsMintOpen(false);
    toast.success(`Agent ${id} registered and Ed25519 Pass minted!`);
  };

  const newestActive = agents.find(a => a.status === "ACTIVE") || agents[0];
  const activeCount = agents.filter(a => a.status === "ACTIVE").length;

  return (
    <main className="min-h-screen pt-32 pb-20 bg-background">
      <div className="container px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">Agent Identity & Delegation</h1>
              <Badge variant="outline" className="text-primary border-primary/30 font-mono text-xs">
                Ed25519 RFC 8037
              </Badge>
            </div>
            <p className="text-white/60 text-sm mt-1">
              Issue scoped cryptographic capability passes, configure per-agent boundaries, and trigger instantaneous emergency revocation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleGlobalKillSwitch}
              variant="destructive"
              className="bg-red-600/90 hover:bg-red-700 text-white font-semibold text-xs h-9 flex items-center gap-1.5 shadow-lg shadow-red-950"
            >
              <AlertOctagon className="w-4 h-4" /> Global Kill Switch
            </Button>

            <Button
              onClick={() => setIsMintOpen(true)}
              className="bg-primary text-black font-semibold hover:bg-primary/90 text-xs h-9 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Register Agent Pass
            </Button>
          </div>
        </div>

        {/* Agents Grid / Table & Identity Card Rail */}
        <div className="mt-8 flex flex-col xl:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Agent Details */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl border shrink-0 ${
                    agent.status === "ACTIVE" 
                      ? "bg-primary/10 border-primary/30 text-primary" 
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    <KeyRound className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                      <span className="font-mono text-xs text-white/50">({agent.id})</span>
                      {agent.status === "ACTIVE" ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-[10px] flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> REVOKED
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1">{agent.role}</p>

                    <div className="flex items-center gap-4 mt-3 text-xs font-mono text-white/70">
                      <span>Key: <code className="text-primary">{agent.keyFingerprint}</code></span>
                      <span>•</span>
                      <span>TTL: {agent.ttlRemaining}</span>
                    </div>
                  </div>
                </div>

                {/* Scopes & Spend Limits */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-mono border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
                  <div>
                    <span className="text-white/40 block mb-1">Spend Budget</span>
                    <span className="text-white font-bold text-sm">
                      ${agent.spentAmount.toFixed(2)} / ${agent.budgetLimit.toFixed(2)}
                    </span>
                    <span className="text-white/40 block text-[10px]">Per-tx: ${agent.perTxLimit.toFixed(2)}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-white/40 block mb-1">Authorized Scopes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.scopes.map((scope, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80 text-[10px]">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAgent(agent)}
                    className="border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs h-9"
                  >
                    View Pass
                  </Button>

                  {agent.status === "ACTIVE" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleKillSwitch(agent.id)}
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 text-xs h-9 flex items-center gap-1"
                    >
                      <PowerOff className="w-3.5 h-3.5" /> Kill Switch
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          </div>

          {/* Right Rail: Signature Identity Card */}
          <div className="w-full xl:w-[440px] max-w-[440px] mx-auto xl:mx-0 shrink-0">
            <ScaledStage designWidth={440} designHeight={586}>
              <IdentityCard
                agentId={newestActive.id}
                fingerprint={newestActive.keyFingerprint}
                additionalPasses={Math.max(activeCount - 1, 0)}
              />
            </ScaledStage>
          </div>
        </div>

        {/* View Pass Dialog */}
        <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
          <DialogContent className="max-w-lg bg-dark_grey/95 backdrop-blur-md border border-white/15 p-6 text-left">
            {selectedAgent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="font-bold text-white text-lg">Cryptographic Pass Token</h3>
                    <p className="text-xs text-white/60 font-mono">Agent: {selectedAgent.id}</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30">RFC 8037 JWKS</Badge>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <span className="text-white/40 block">Decoded Claims:</span>
                    <pre className="p-3 rounded-lg bg-black/60 border border-white/10 text-[11px] text-primary overflow-x-auto">
{JSON.stringify({
  sub: selectedAgent.id,
  iss: "passport-trust-gateway",
  aud: "agent-swarm-cluster",
  scopes: selectedAgent.scopes,
  budget: {
    limit: selectedAgent.budgetLimit,
    per_tx: selectedAgent.perTxLimit,
  },
  status: selectedAgent.status,
  fingerprint: selectedAgent.keyFingerprint,
}, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <span className="text-white/40 block mb-1">Raw Token:</span>
                    <div className="p-2.5 rounded bg-black/40 border border-white/10 text-white/70 break-all select-all text-[10px]">
                      {selectedAgent.token}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAgent.token || "");
                    toast.success("Token copied to clipboard");
                  }}
                  className="w-full bg-primary text-black font-semibold hover:bg-primary/90 text-xs h-9 flex items-center justify-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Delegation Pass Token
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Mint New Agent Dialog */}
        <Dialog open={isMintOpen} onOpenChange={setIsMintOpen}>
          <DialogContent className="max-w-md bg-dark_grey/95 backdrop-blur-md border border-white/15 p-6 text-left">
            <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Register Agent & Mint Pass
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Cryptographically bounds autonomous agent agency with explicit scopes and spend caps.
            </p>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-white/80 block mb-1">Agent ID</label>
                <Input
                  value={newAgentId}
                  onChange={(e) => setNewAgentId(e.target.value)}
                  placeholder="e.g. agent_analyst_04"
                  className="bg-black/30 border-white/10 text-white font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/80 block mb-1">Agent Role / Description</label>
                <Input
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Financial Reporting Bot"
                  className="bg-black/30 border-white/10 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/80 block mb-1">Allowed Scopes</label>
                <Input
                  value={newScopes}
                  onChange={(e) => setNewScopes(e.target.value)}
                  className="bg-black/30 border-white/10 text-white font-mono text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-white/80 block mb-1">Spend Budget ($)</label>
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="bg-black/30 border-white/10 text-white font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/80 block mb-1">Per-Tx Cap ($)</label>
                  <Input
                    type="number"
                    value={newPerTx}
                    onChange={(e) => setNewPerTx(e.target.value)}
                    className="bg-black/30 border-white/10 text-white font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-black font-semibold hover:bg-primary/90 mt-2 h-10 text-xs"
              >
                Mint Cryptographic Pass
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
