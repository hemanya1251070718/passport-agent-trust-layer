'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { KeyRound, ShieldCheck, CreditCard, FileCheck2, ArrowRight } from 'lucide-react'
import { SecurityLifecyclePhoneMockup } from './phone-lifecycle'

const TimeLine = () => {
  return (
    <section className='py-24' id='development'>
      <div className='container mx-auto px-4 lg:max-w-7xl'>
        {/* Section Header */}
        <div className='text-center max-w-3xl mx-auto mb-16'>
          <p className='text-primary text-sm font-semibold uppercase tracking-wider mb-3'>
            Lifecycle Architecture
          </p>
          <h2 className='text-white sm:text-5xl text-3xl font-bold tracking-tight leading-tight mb-5'>
            The 4-Stage Security Lifecycle of Every Agent Task
          </h2>
          <p className='text-white/70 text-lg leading-relaxed'>
            From token minting to financial settlement and immutable logging, every autonomous action
            passes through four deterministic checkpoints in under a millisecond.
          </p>
        </div>

        {/* 3-Column Zero-Overlap Control Center Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-center'>
          {/* Left Column: Stages 1 & 3 */}
          <div className='lg:col-span-4 flex flex-col gap-6'>
            {/* Stage 1: Delegation */}
            <motion.div
              whileInView={{ x: 0, opacity: 1 }}
              initial={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className='p-6 rounded-2xl bg-zinc-900/70 border border-white/10 hover:border-cyan-500/40 hover:bg-zinc-900/90 transition-all shadow-lg backdrop-blur-md'
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'>
                  <KeyRound className='w-5 h-5' />
                </div>
                <span className='text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'>
                  STAGE 01
                </span>
              </div>
              <h3 className='text-white text-lg font-bold mb-2'>Scoped Permission Pass</h3>
              <p className='text-white/70 text-sm leading-relaxed mb-4'>
                Mint short-lived, Ed25519-signed credentials bound to specific tools, endpoints, and expiration windows. Agents cannot forge or escalate privileges.
              </p>
              <div className='flex flex-wrap gap-1.5'>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  RFC 8037 JWKS
                </span>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  Explicit Scopes
                </span>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  1-Hour TTL
                </span>
              </div>
            </motion.div>

            {/* Stage 3: Spend Sandboxing */}
            <motion.div
              whileInView={{ x: 0, opacity: 1 }}
              initial={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className='p-6 rounded-2xl bg-zinc-900/70 border border-white/10 hover:border-emerald-500/40 hover:bg-zinc-900/90 transition-all shadow-lg backdrop-blur-md'
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'>
                  <CreditCard className='w-5 h-5' />
                </div>
                <span className='text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'>
                  STAGE 03
                </span>
              </div>
              <h3 className='text-white text-lg font-bold mb-2'>Dynamic Budget Guardrails</h3>
              <p className='text-white/70 text-sm leading-relaxed mb-4'>
                Virtual cards enforce hard financial ceilings per task and per 24 hours. Automatic merchant category matching prevents runaway spend and recurring charges.
              </p>
              <div className='flex flex-wrap gap-1.5'>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  Per-Tx Cap ($15)
                </span>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  Velocity Checks
                </span>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  Merchant Locking
                </span>
              </div>
            </motion.div>
          </div>

          {/* Center Column: Phone Mockup */}
          <div className='lg:col-span-4 flex justify-center items-center py-4'>
            <motion.div
              whileInView={{ scale: 1, opacity: 1 }}
              initial={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className='w-full'
            >
              <SecurityLifecyclePhoneMockup />
            </motion.div>
          </div>

          {/* Right Column: Stages 2 & 4 */}
          <div className='lg:col-span-4 flex flex-col gap-6'>
            {/* Stage 2: Policy Intercept */}
            <motion.div
              whileInView={{ x: 0, opacity: 1 }}
              initial={{ x: 30, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className='p-6 rounded-2xl bg-zinc-900/70 border border-white/10 hover:border-primary/40 hover:bg-zinc-900/90 transition-all shadow-lg backdrop-blur-md'
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30'>
                  <ShieldCheck className='w-5 h-5' />
                </div>
                <span className='text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20'>
                  STAGE 02
                </span>
              </div>
              <h3 className='text-white text-lg font-bold mb-2'>Pre-Execution Firewall</h3>
              <p className='text-white/70 text-sm leading-relaxed mb-4'>
                Inspect tool inputs and network calls in under 0.1ms before code executes. Catch SSRF attempts, internal cloud metadata probes, and injection patterns.
              </p>
              <div className='flex flex-wrap gap-1.5'>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  0.082ms Latency
                </span>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  Default-Deny
                </span>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  SSRF Filtered
                </span>
              </div>
            </motion.div>

            {/* Stage 4: Audit Ledger */}
            <motion.div
              whileInView={{ x: 0, opacity: 1 }}
              initial={{ x: 30, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className='p-6 rounded-2xl bg-zinc-900/70 border border-white/10 hover:border-purple-500/40 hover:bg-zinc-900/90 transition-all shadow-lg backdrop-blur-md'
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30'>
                  <FileCheck2 className='w-5 h-5' />
                </div>
                <span className='text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20'>
                  STAGE 04
                </span>
              </div>
              <h3 className='text-white text-lg font-bold mb-2'>Immutable Flight Recorder</h3>
              <p className='text-white/70 text-sm leading-relaxed mb-4'>
                Every prompt, decision, and dollar spent is permanently recorded into an append-only SHA-256 hash-chained ledger for instant SOC 2 and audit compliance.
              </p>
              <div className='flex flex-wrap gap-1.5'>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  SHA-256 Chained
                </span>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  Non-Repudiation
                </span>
                <span className='text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10'>
                  Audit-Ready
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TimeLine
