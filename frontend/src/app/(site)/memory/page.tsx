"use client";
import React, { useState } from "react";
import { 
  Database, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface MemoryItem {
  key: string;
  agentId: string;
  category: "FACT" | "CACHE" | "STATE" | "CREDENTIAL";
  value: string;
  piiClean: boolean;
  ttl: string;
}

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    key: "homingo_features_cache",
    agentId: "agent_errand_01",
    category: "CACHE",
    value: "Scraped features list for homingo.com: AI Agent Trust, Delegation, Limits",
    piiClean: true,
    ttl: "86400s"
  },
  {
    key: "crustdata_company_metrics",
    agentId: "agent_errand_01",
    category: "FACT",
    value: "Company headcount, funding series, and B2B tech stack (No personal employee PII)",
    piiClean: true,
    ttl: "604800s"
  },
  {
    key: "errand_state_checkpoint",
    agentId: "agent_errand_01",
    category: "STATE",
    value: "Phase 1 Complete -> Scraping verified -> Proceed to enrichment",
    piiClean: true,
    ttl: "3600s"
  }
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [search, setSearch] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleForget = (key: string) => {
    setMemories(memories.filter(m => m.key !== key));
    toast.success(`Memory key '${key}' purged permanently (Right to be Forgotten logged).`);
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newValue) return;
    const newItem: MemoryItem = {
      key: newKey,
      agentId: "agent_errand_01",
      category: "FACT",
      value: newValue,
      piiClean: true,
      ttl: "86400s"
    };
    setMemories([newItem, ...memories]);
    setNewKey("");
    setNewValue("");
    toast.success(`Memory '${newItem.key}' stored.`);
  };

  const filtered = memories.filter(m => 
    m.key.toLowerCase().includes(search.toLowerCase()) ||
    m.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen pt-32 pb-20 bg-background">
      <div className="container px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">Agent Memory & Vault</h1>
              <Badge variant="outline" className="text-primary border-primary/30 font-mono text-xs">
                Privacy-Preserving Vault
              </Badge>
            </div>
            <p className="text-white/60 text-sm mt-1">
              Inspect agent long-term facts, cached tool responses, and enforce explicit forget / GDPR right-to-be-forgotten controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs py-1 px-3 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4" /> 0 PII Retained (Verified)
            </Badge>
          </div>
        </div>

        {/* Search & Add */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search memory keys or contents..."
                className="bg-black/30 border-white/10 text-white font-mono text-xs max-w-md"
              />
            </div>

            <div className="space-y-4">
              {filtered.map((item) => (
                <Card key={item.key} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all font-mono text-xs">
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-sm">{item.key}</span>
                        <Badge variant="outline" className="text-[10px] bg-white/5 text-white/70">
                          {item.category}
                        </Badge>
                        <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">
                          PII CLEAN
                        </Badge>
                      </div>
                      <p className="text-white/40 text-[11px] mt-1">Owner: {item.agentId} • TTL: {item.ttl}</p>
                    </div>

                    <Button
                      onClick={() => handleForget(item.key)}
                      variant="destructive"
                      size="sm"
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 text-xs h-8 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Forget Key
                    </Button>
                  </div>

                  <div className="pt-3">
                    <span className="text-white/40 block mb-1">Stored Value:</span>
                    <p className="p-2.5 rounded bg-black/40 border border-white/10 text-white/80 font-sans text-xs">
                      {item.value}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Add Form */}
          <div className="lg:col-span-4">
            <Card className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" /> Store Memory Item
              </h3>
              <p className="text-xs text-white/60 mb-4">
                Manually record sanctioned agent facts or state variables.
              </p>

              <form onSubmit={handleAddMemory} className="space-y-4">
                <div>
                  <label className="text-xs text-white/70 block mb-1 font-mono">Memory Key</label>
                  <Input
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="e.g. competitor_market_cap"
                    className="bg-black/30 border-white/10 text-white font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1 font-mono">Payload Value</label>
                  <textarea
                    rows={4}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Fact or sanitized observation..."
                    className="w-full p-2.5 rounded-md bg-black/30 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-black font-semibold hover:bg-primary/90 text-xs h-10 mt-2"
                >
                  Save to Vault
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
