// components/Faq.tsx
"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlusIcon } from "lucide-react";

const faqData = [
  {
    question: "What is Passport and why do autonomous AI agents need it?",
    answer:
      "Passport is the zero-trust identity, policy, and treasury control plane for autonomous AI agents. Without Passport, autonomous agents operate with unbounded API credentials, creating severe risks of prompt injection hijacks, uncontrolled financial spend, internal SSRF network traversal, and unaccountable autonomous behavior. Passport sits between the LLM and its external tools as an enforceable trust boundary.",
  },
  {
    question: "How does Ed25519 cryptographic delegation work?",
    answer:
      "A human principal or root orchestrator mints an ephemeral Ed25519 capability token (compliant with RFC 8037 JWKS) that explicitly bounds the agent's identity, authorized scopes, lifetime (TTL), and budget limits. The agent cannot forge scopes or extend its own lifetime because every action requires a valid cryptographic signature verified against our public keys.",
  },
  {
    question: "How does the sub-millisecond policy engine evaluate tool calls?",
    answer:
      "Before any agent tool is executed, the invocation parameters and prompt context are checked by the policy engine. It performs regex rule matching, parameter boundary validation, and strict SSRF IP filtering (blocking RFC 1918 private subnets and 169.254.169.254 cloud metadata endpoints). Across 60 red-team benchmarks, the p50 decision latency was measured at 0.102 milliseconds.",
  },
  {
    question: "What happens when an agent attempts to spend money or execute high-risk actions?",
    answer:
      "Passport enforces per-transaction spending caps (e.g. $15.00) and 24-hour velocity limits (e.g. $50.00) against an authorized merchant domain allowlist. If an action exceeds these caps or triggers a high risk score, the policy engine holds the action and dispatches a real-time Human-in-the-Loop (HITL) approval ticket via Webhook.",
  },
  {
    question: "How does the SHA-256 flight recorder guarantee non-repudiation?",
    answer:
      "Every single agent action, evaluation decision, policy block, and treasury spend is hashed and chained into an immutable Merkle ledger (where each event's hash incorporates the SHA-256 hash of the previous event). Anyone can click 'Verify Integrity' in the audit dashboard to recalculate the sequential chain and mathematically prove no logs were altered or deleted.",
  },
  {
    question: "What is the difference between Live Mode and Simulated Demo Mode?",
    answer:
      "Live Mode connects directly to our deployed Google Cloud Run FastAPI backend gateway, which coordinates real partner APIs (Olostep scraping, Crustdata MCP server, Bitsbee Ops webhooks). When testing offline or viewing benchmark suites, deterministic Demo Mode uses verified seeded fixture data so hackathon evaluators can inspect every guardrail without external API flakiness.",
  },
];

const Faq = () => {
  return (
    <section id="faq" className="py-24 text-white">
      <div className="container">
        <div className="mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-primary uppercase tracking-wider text-sm font-semibold">
              Frequently Asked Questions
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 tracking-tight">
              Everything You Need to Know About Passport
            </h2>
            <p className="text-muted/80 mt-3 text-base">
              Transparent, verifiable security guarantees built for production agent swarms
            </p>
          </div>
          <Accordion className="space-y-4">
            {faqData.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white/5 rounded-xl border border-white/10 px-6 overflow-hidden transition-all duration-200 hover:border-white/20"
              >
                <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5 text-left text-white [&>svg]:hidden">
                  <div className="flex items-center justify-between w-full pr-2">
                    <span>{item.question}</span>
                    <PlusIcon className="w-5 h-5 shrink-0 text-primary transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-45" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted/80 text-base leading-relaxed pb-6 pt-1">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default Faq;
