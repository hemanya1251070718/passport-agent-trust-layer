"use client";
import React, { useState } from "react";
import { 
  DollarSign, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight, 
  Building2 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PeakChart } from "@/components/ui/peak-chart";
import toast from "react-hot-toast";

interface Transaction {
  id: string;
  timestamp: string;
  agentId: string;
  merchant: string;
  purpose: string;
  amount: number;
  status: "SETTLED" | "BLOCKED" | "PENDING_APPROVAL";
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_sand_01",
    timestamp: "2026-11-21 14:48:14",
    agentId: "agent_errand_01",
    merchant: "api.olostep.com",
    purpose: "Olostep scraping quota allocation",
    amount: 8.50,
    status: "SETTLED"
  },
  {
    id: "tx_sand_02",
    timestamp: "2026-11-21 14:40:02",
    agentId: "agent_errand_01",
    merchant: "api.olostep.com",
    purpose: "Enterprise scraper batch (exceeded per-tx cap)",
    amount: 28.50,
    status: "PENDING_APPROVAL"
  },
  {
    id: "tx_sand_03",
    timestamp: "2026-11-21 13:15:22",
    agentId: "agent_researcher_02",
    merchant: "api.crustdata.com",
    purpose: "B2B enrichment credits",
    amount: 2.10,
    status: "SETTLED"
  },
  {
    id: "tx_sand_04",
    timestamp: "2026-11-21 12:02:11",
    agentId: "agent_rogue_09",
    merchant: "malicious-giftcards.io",
    purpose: "Unauthorized giftcard checkout",
    amount: 150.00,
    status: "BLOCKED"
  }
];

export default function WalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [spentToday, setSpentToday] = useState(8.50);
  const dailyCap = 50.00;
  const perTxCap = 15.00;

  // New Spend Form
  const [spendAgent, setSpendAgent] = useState("agent_errand_01");
  const [spendMerchant, setSpendMerchant] = useState("api.olostep.com");
  const [spendAmount, setSpendAmount] = useState("4.50");
  const [spendPurpose, setSpendPurpose] = useState("Supplemental web page parse");
  const [loading, setLoading] = useState(false);

  const handleSpend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const amt = parseFloat(spendAmount) || 0;

    // Check rules
    const allowedMerchants = ["api.olostep.com", "api.crustdata.com", "homingo.com"];
    const merchantAllowed = allowedMerchants.includes(spendMerchant.trim());
    const exceedsPerTx = amt > perTxCap;
    const exceedsDaily = (spentToday + amt) > dailyCap;

    const newTx: Transaction = {
      id: `tx_sand_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      agentId: spendAgent,
      merchant: spendMerchant,
      purpose: spendPurpose,
      amount: amt,
      status: !merchantAllowed ? "BLOCKED" : exceedsPerTx || exceedsDaily ? "PENDING_APPROVAL" : "SETTLED"
    };

    setTransactions([newTx, ...transactions]);

    if (newTx.status === "SETTLED") {
      setSpentToday(prev => prev + amt);
      toast.success(`Virtual spend of $${amt.toFixed(2)} settled successfully!`);
    } else if (newTx.status === "PENDING_APPROVAL") {
      toast.error(`Spend held: Amount ($${amt.toFixed(2)}) requires human approval!`);
    } else {
      toast.error(`Spend blocked: Merchant '${spendMerchant}' not on allowlist!`);
    }

    setLoading(false);
  };

  const exportCSV = () => {
    const headers = "TransactionID,Timestamp,AgentID,Merchant,Purpose,Amount,Status\n";
    const rows = transactions.map(t => 
      `"${t.id}","${t.timestamp}","${t.agentId}","${t.merchant}","${t.purpose}",${t.amount},"${t.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `passport_wallet_ledger_${Date.now()}.csv`;
    a.click();
    toast.success("Ledger exported as CSV");
  };

  const progressPercent = Math.min(100, (spentToday / dailyCap) * 100);

  return (
    <main className="min-h-screen pt-32 pb-20 bg-background">
      <div className="container px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">Sandboxed Agent Treasury</h1>
              <Badge variant="outline" className="text-primary border-primary/30 font-mono text-xs">
                Simulated Sandbox
              </Badge>
            </div>
            <p className="text-white/60 text-sm mt-1">
              Multi-currency ephemeral virtual cards with strict velocity limits, merchant domain whitelisting, and per-tx caps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={exportCSV}
              variant="outline"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs h-9 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Treasury Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <Card className="bg-white/5 border border-white/10 rounded-xl p-6">
            <span className="text-xs text-white/50 block uppercase tracking-wider mb-1">24h Velocity Limit</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">${spentToday.toFixed(2)}</span>
              <span className="text-sm text-white/50 font-mono">/ ${dailyCap.toFixed(2)}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500 rounded-full" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-white/60 mt-2 font-mono">
              ${(dailyCap - spentToday).toFixed(2)} remaining today
            </p>
          </Card>

          <Card className="bg-white/5 border border-white/10 rounded-xl p-6">
            <span className="text-xs text-white/50 block uppercase tracking-wider mb-1">Per-Transaction Cap</span>
            <span className="text-3xl font-bold text-primary font-mono">${perTxCap.toFixed(2)}</span>
            <p className="text-xs text-white/60 mt-3">
              Any single outlay above ${perTxCap.toFixed(2)} automatically holds for Human-in-the-Loop review.
            </p>
          </Card>

          <Card className="bg-white/5 border border-white/10 rounded-xl p-6">
            <span className="text-xs text-white/50 block uppercase tracking-wider mb-1">Authorized Merchants</span>
            <span className="text-3xl font-bold text-emerald-400 font-mono">3 Domains</span>
            <p className="text-xs text-white/60 mt-3 font-mono">
              api.olostep.com, api.crustdata.com, homingo.com
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Transaction History */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Virtual Transaction Ledger
                </h3>
                <span className="text-xs text-white/40 font-mono">{transactions.length} records</span>
              </div>

              <div className="divide-y divide-white/5 mt-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        tx.status === "SETTLED" ? "bg-emerald-500/10 text-emerald-400" : tx.status === "BLOCKED" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {tx.status === "SETTLED" ? <CheckCircle2 className="w-4 h-4" /> : tx.status === "BLOCKED" ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white/90 font-bold">{tx.merchant}</span>
                          <span className="text-white/40">•</span>
                          <span className="font-mono text-xs text-primary">{tx.agentId}</span>
                        </div>
                        <p className="text-xs text-white/60 mt-0.5">{tx.purpose}</p>
                        <span className="text-[10px] text-white/40 font-mono">{tx.timestamp}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-sm text-white block">
                        ${tx.amount.toFixed(2)}
                      </span>
                      <Badge className={`text-[10px] font-mono mt-1 ${
                        tx.status === "SETTLED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : tx.status === "BLOCKED" ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Telemetry & Simulate Spend */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex flex-col items-center justify-center">
              <span className="text-xs text-white/50 block font-mono uppercase tracking-wider mb-2 self-start">
                Velocity Curve
              </span>
              <PeakChart
                width={320}
                value={spentToday}
                valueSuffix=" USD"
                decimals={2}
                title="24h Spend Velocity"
                caption="Current cumulative spend against daily boundary"
                accent="#10b981"
                updatedText="Audited in Ledger"
              />
            </div>

            <Card className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" /> Simulate Virtual Spend
              </h3>
              <p className="text-xs text-white/60 mb-4">
                Test spend velocity, per-tx caps, and merchant allowlist rules.
              </p>

              <form onSubmit={handleSpend} className="space-y-4">
                <div>
                  <label className="text-xs text-white/70 block mb-1 font-mono">Agent</label>
                  <Input
                    value={spendAgent}
                    onChange={(e) => setSpendAgent(e.target.value)}
                    className="bg-black/30 border-white/10 text-white font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1 font-mono">Merchant Domain</label>
                  <Input
                    value={spendMerchant}
                    onChange={(e) => setSpendMerchant(e.target.value)}
                    className="bg-black/30 border-white/10 text-white font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1 font-mono">Amount ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(e.target.value)}
                    className="bg-black/30 border-white/10 text-white font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1 font-mono">Purpose</label>
                  <Input
                    value={spendPurpose}
                    onChange={(e) => setSpendPurpose(e.target.value)}
                    className="bg-black/30 border-white/10 text-white text-xs"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    onClick={() => {
                      setSpendAmount("28.50");
                      setSpendMerchant("api.olostep.com");
                    }}
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7 px-2 border-amber-500/30 text-amber-400 bg-amber-500/10"
                  >
                    Test &gt;$15 Cap
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setSpendAmount("12.00");
                      setSpendMerchant("unauthorized-store.com");
                    }}
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7 px-2 border-red-500/30 text-red-400 bg-red-500/10"
                  >
                    Test Rogue Domain
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-black font-semibold hover:bg-primary/90 text-xs h-10 mt-2"
                >
                  {loading ? "Processing..." : "Execute Card Charge"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
