"use client";
import React, { useState } from "react";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  DollarSign, 
  Terminal, 
  UserCheck, 
  RefreshCw 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ApprovalTicket {
  id: string;
  agentId: string;
  tool: string;
  parameters: Record<string, any>;
  riskScore: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  timestamp: string;
}

const INITIAL_TICKETS: ApprovalTicket[] = [
  {
    id: "tkt_appr_8921",
    agentId: "agent_errand_01",
    tool: "wallet.spend",
    parameters: {
      amount: 28.50,
      merchant: "api.olostep.com",
      purpose: "Enterprise high-concurrency batch web scrape"
    },
    riskScore: 0.72,
    reason: "Requested spend ($28.50) exceeds configured per-transaction cap ($15.00)",
    status: "PENDING",
    timestamp: "2 mins ago"
  },
  {
    id: "tkt_appr_8894",
    agentId: "agent_analyst_03",
    tool: "crustdata.enrich_company",
    parameters: {
      domain: "competitor-stealth.ai",
      enrichment_depth: "deep"
    },
    riskScore: 0.45,
    reason: "Unusual batch enrichment query frequency detected",
    status: "APPROVED",
    timestamp: "1 hour ago"
  },
  {
    id: "tkt_appr_8720",
    agentId: "agent_rogue_09",
    tool: "network.http_get",
    parameters: {
      url: "http://169.254.169.254/computeMetadata/v1/"
    },
    riskScore: 0.99,
    reason: "Severe SSRF attempt to Cloud Metadata IP address intercepted",
    status: "REJECTED",
    timestamp: "3 hours ago"
  }
];

export default function ApprovalsPage() {
  const [tickets, setTickets] = useState<ApprovalTicket[]>(INITIAL_TICKETS);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL");

  const handleApprove = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "APPROVED" } : t));
    toast.success(`Ticket ${id} APPROVED. Execution token dispatched to agent.`);
  };

  const handleReject = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "REJECTED" } : t));
    toast.error(`Ticket ${id} REJECTED. Tool execution denied.`);
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === "PENDING") return t.status === "PENDING";
    if (filter === "RESOLVED") return t.status !== "PENDING";
    return true;
  });

  const pendingCount = tickets.filter(t => t.status === "PENDING").length;

  return (
    <main className="min-h-screen pt-32 pb-20 bg-background">
      <div className="container px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">Human-in-the-Loop Approvals</h1>
              <Badge variant="outline" className="text-primary border-primary/30 font-mono text-xs">
                Real-Time Queue
              </Badge>
            </div>
            <p className="text-white/60 text-sm mt-1">
              Review and authorize high-risk tool calls and out-of-bounds treasury spending requests before execution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("ALL")}
              className="text-xs h-9"
            >
              All ({tickets.length})
            </Button>
            <Button
              variant={filter === "PENDING" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("PENDING")}
              className="text-xs h-9"
            >
              Pending ({pendingCount})
            </Button>
            <Button
              variant={filter === "RESOLVED" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("RESOLVED")}
              className="text-xs h-9"
            >
              Resolved
            </Button>
          </div>
        </div>

        {/* Tickets List */}
        <div className="mt-8 space-y-4">
          {filteredTickets.length === 0 ? (
            <Card className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Queue Empty</h3>
              <p className="text-sm text-white/50 mt-1">No pending tickets match the current filter.</p>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Info */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border shrink-0 ${
                      ticket.status === "PENDING"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : ticket.status === "APPROVED"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}>
                      {ticket.status === "PENDING" ? <Clock className="w-6 h-6" /> : ticket.status === "APPROVED" ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-bold text-white">{ticket.id}</span>
                        <span className="text-white/40">•</span>
                        <span className="font-mono text-xs text-primary">{ticket.agentId}</span>
                        <Badge className={`text-[10px] font-mono ${
                          ticket.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : ticket.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-red-500/20 text-red-400 border-red-500/40"
                        }`}>
                          {ticket.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-white/90 font-medium mt-1">
                        Tool: <code className="text-primary font-mono">{ticket.tool}</code>
                      </p>

                      <p className="text-xs text-white/70 mt-1">
                        <span className="text-white/40">Reason:</span> {ticket.reason}
                      </p>

                      <div className="p-2.5 rounded bg-black/40 border border-white/10 text-[11px] font-mono text-white/80 mt-3 max-w-xl overflow-x-auto">
                        {JSON.stringify(ticket.parameters)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Risk & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
                    <div className="text-right">
                      <span className="text-xs text-white/40 block">Risk Score</span>
                      <span className={`text-xl font-bold font-mono ${
                        ticket.riskScore > 0.7 ? "text-red-400" : ticket.riskScore > 0.4 ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {ticket.riskScore.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-white/40 block">{ticket.timestamp}</span>
                    </div>

                    {ticket.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleReject(ticket.id)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 text-xs h-9"
                        >
                          Deny
                        </Button>
                        <Button
                          onClick={() => handleApprove(ticket.id)}
                          size="sm"
                          className="bg-primary text-black font-semibold hover:bg-primary/90 text-xs h-9"
                        >
                          Approve Action
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
