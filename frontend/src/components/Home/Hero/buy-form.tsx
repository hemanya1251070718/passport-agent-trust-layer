"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import Logo from "@/components/Layout/Header/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Shield, Zap } from "lucide-react";

export default function MintPassModal() {
  const [agentId, setAgentId] = useState("agent_errand_01");
  const [budgetLimit, setBudgetLimit] = useState("25.00");
  const [perTxLimit, setPerTxLimit] = useState("10.00");
  const [scopes, setScopes] = useState("olostep:scrape, crustdata:enrich, wallet:spend");
  const [loading, setLoading] = useState(false);
  const [mintedToken, setMintedToken] = useState<string | null>(null);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://passport-trust-gateway-58223756937.asia-south1.run.app/api/v1/auth/mint-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          scopes: scopes.split(",").map(s => s.trim()),
          budget_limit: parseFloat(budgetLimit) || 25,
          per_tx_limit: parseFloat(perTxLimit) || 10,
          allowed_merchants: ["api.olostep.com", "api.crustdata.com"],
          expires_in_seconds: 3600
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMintedToken(data.delegation_token);
        toast.success("Ed25519 Delegation Pass minted successfully!");
      } else {
        // Fallback for offline demo
        const fakeToken = "eyJhbGciOiJFZERTQSI...simulated_pass_token";
        setMintedToken(fakeToken);
        toast.success("Delegation Pass generated (Demo Mode)");
      }
    } catch (err: any) {
      const fakeToken = "eyJhbGciOiJFZERTQSI...simulated_pass_token";
      setMintedToken(fakeToken);
      toast.success("Delegation Pass generated (Demo Mode)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" /> Mint Ed25519 Delegation Pass
          </h3>
          <p className="text-xs text-white/60">Cryptographic capability token with least-privilege scopes</p>
        </div>
        <Badge variant="outline" className="text-primary border-primary/30">RFC 8037</Badge>
      </div>

      <form onSubmit={handleMint} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-white/80 block mb-1">Agent Identifier</label>
          <Input
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="bg-black/30 border-white/10 text-white font-mono text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-white/80 block mb-1">Max Budget ($)</label>
            <Input
              type="number"
              step="0.01"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="bg-black/30 border-white/10 text-white font-mono text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/80 block mb-1">Per-Tx Cap ($)</label>
            <Input
              type="number"
              step="0.01"
              value={perTxLimit}
              onChange={(e) => setPerTxLimit(e.target.value)}
              className="bg-black/30 border-white/10 text-white font-mono text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-white/80 block mb-1">Allowed Scopes</label>
          <Input
            value={scopes}
            onChange={(e) => setScopes(e.target.value)}
            className="bg-black/30 border-white/10 text-white font-mono text-xs"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-black font-semibold hover:bg-primary/90 mt-2 h-11"
        >
          {loading ? "Minting Cryptographic Pass..." : "Mint Delegation Pass"}
        </Button>
      </form>

      {mintedToken && (
        <div className="p-3 rounded-lg bg-black/50 border border-primary/30 text-xs mt-2">
          <p className="text-primary font-semibold mb-1 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Ed25519 Delegation Token:
          </p>
          <p className="font-mono text-white/70 break-all select-all">{mintedToken}</p>
        </div>
      )}
    </div>
  );
}
