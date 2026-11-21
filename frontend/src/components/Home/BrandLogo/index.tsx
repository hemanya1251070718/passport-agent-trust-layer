'use client';
import React, { useState, useEffect } from 'react';
import Slider from 'react-infinite-logo-slider';
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Clock, CheckCircle2 } from "lucide-react";

interface AuditTickerEvent {
  id: string;
  type: 'ALLOW' | 'DENY' | 'APPROVE_REQ' | 'SETTLED';
  agent: string;
  detail: string;
  timestamp: string;
}

const DEFAULT_EVENTS: AuditTickerEvent[] = [
  { id: '1', type: 'ALLOW', agent: 'agent_errand_01', detail: 'olostep.scrape("homingo.com")', timestamp: 'just now' },
  { id: '2', type: 'DENY', agent: 'agent_rogue_09', detail: 'SSRF blocked -> 169.254.169.254:80', timestamp: '1m ago' },
  { id: '3', type: 'APPROVE_REQ', agent: 'agent_errand_01', detail: 'Spend $28.50 exceeds $15 cap', timestamp: '2m ago' },
  { id: '4', type: 'DENY', agent: 'agent_rogue_14', detail: 'Prompt injection pattern intercepted', timestamp: '3m ago' },
  { id: '5', type: 'ALLOW', agent: 'agent_analyst_03', detail: 'crustdata.enrich_company("acme")', timestamp: '4m ago' },
  { id: '6', type: 'SETTLED', agent: 'agent_errand_01', detail: 'Virtual Card $8.50 on olostep.com', timestamp: '5m ago' },
  { id: '7', type: 'DENY', agent: 'agent_shadow_02', detail: 'crustdata.people_search unauthorized scope', timestamp: '6m ago' },
  { id: '8', type: 'ALLOW', agent: 'agent_errand_01', detail: 'bitsbee.ops_webhook dispatched', timestamp: '7m ago' },
];

export default function BrandLogo() {
  const [events, setEvents] = useState<AuditTickerEvent[]>(DEFAULT_EVENTS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Attempt to pull latest live audit ledger from Cloud Run backend
    const fetchLiveAudit = async () => {
      try {
        const res = await fetch("https://passport-trust-gateway-58223756937.asia-south1.run.app/api/v1/audit/ledger?limit=10");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((item: any, idx: number) => ({
              id: String(item.index || idx),
              type: item.status === 'ALLOWED' || item.status === 'SETTLED' ? item.status : item.status === 'DENIED' ? 'DENY' : 'APPROVE_REQ',
              agent: item.agent_id || 'agent_01',
              detail: `${item.action} (${JSON.stringify(item.details || {}).slice(0, 35)}...)`,
              timestamp: item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'live',
            }));
            setEvents(mapped);
            setIsLive(true);
          }
        }
      } catch (e) {
        // Fallback to simulated deterministic ticker mode
        setIsLive(false);
      }
    };
    fetchLiveAudit();
  }, []);

  return (
    <section className="border-y border-white/10 bg-dark_grey/40 backdrop-blur-md py-6 my-12">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-primary' : 'bg-chart-5'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-primary' : 'bg-chart-5'}`}></span>
            </span>
            <span className="text-sm font-semibold tracking-wide uppercase text-white/90">
              {isLive ? 'Live Agent Interception Stream' : 'Live Flight Recorder Stream (Simulated Demo Mode)'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>Verified SHA-256 Hash Chain</span>
            <span>•</span>
            <span>Sub-millisecond Policy Interception</span>
          </div>
        </div>

        <div className="py-2">
          <Slider
            width="340px"
            duration={25}
            pauseOnHover={true}
            blurBorders={false}
          >
            {events.map((evt) => (
              <Slider.Slide key={evt.id}>
                <div className="mr-4 px-4 py-3 rounded-lg border border-white/10 bg-white/5 flex items-center gap-3 w-80 text-left">
                  {evt.type === 'ALLOW' && (
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" /> ALLOW
                    </Badge>
                  )}
                  {evt.type === 'DENY' && (
                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1 shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5" /> DENY
                    </Badge>
                  )}
                  {evt.type === 'APPROVE_REQ' && (
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1 shrink-0">
                      <Clock className="w-3.5 h-3.5" /> APPROVAL
                    </Badge>
                  )}
                  {evt.type === 'SETTLED' && (
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SETTLED
                    </Badge>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-mono text-white/90 truncate">{evt.agent}</p>
                    <p className="text-[11px] text-white/60 font-mono truncate">{evt.detail}</p>
                  </div>
                </div>
              </Slider.Slide>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
