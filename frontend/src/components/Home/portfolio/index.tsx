'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { KeyRound, ShieldAlert, CreditCard, FileCheck2, ArrowRight } from 'lucide-react'
import { DefenseCardsMockup } from './defense-cards-mockup'

const capabilities = [
  {
    icon: KeyRound,
    color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    title: 'Cryptographic Delegation & Identity (RFC 8037)',
    description:
      'Issue tamper-evident Ed25519 tokens with verified scopes, deterministic expiration, and automatic key rotation.',
  },
  {
    icon: ShieldAlert,
    color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    title: 'Sub-Millisecond Policy & SSRF Interception',
    description:
      'Evaluate tool parameters and API destinations in 0.082ms. Block SSRF, AWS/GCP metadata probes, and malicious prompts.',
  },
  {
    icon: CreditCard,
    color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    title: 'Velocity-Controlled Multi-Currency Treasury',
    description:
      'Deploy single-use virtual cards capped per transaction ($15) and per day ($50) to prevent runaway charges and rogue subscriptions.',
  },
  {
    icon: FileCheck2,
    color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    title: 'SHA-256 Verifiable Audit Flight Recorder',
    description:
      'Every prompt, decision, and financial settlement is chained into an append-only cryptographic ledger ready for SOC 2 compliance.',
  },
]

const Portfolio = () => {
  return (
    <section className='pt-24' id='portfolio'>
      <div className='container mx-auto px-4 lg:max-w-7xl'>
        <div className='grid lg:grid-cols-2 items-center gap-12 lg:gap-16'>
          {/* Left Column: Interactive Defense Mockup */}
          <motion.div
            whileInView={{ y: 0, opacity: 1 }}
            initial={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className='w-full'
          >
            <DefenseCardsMockup />
          </motion.div>

          {/* Right Column: High-Impact Capabilities (Replacing old table) */}
          <motion.div
            whileInView={{ y: 0, opacity: 1 }}
            initial={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className='flex flex-col gap-6'
          >
            <div>
              <p className='text-primary text-sm font-semibold uppercase tracking-wider mb-2'>
                Zero-Trust Control Architecture
              </p>
              <h2 className='text-white sm:text-5xl text-3xl font-bold leading-tight'>
                Complete Defense-in-Depth for Autonomous Swarms
              </h2>
              <p className='text-white/70 text-base sm:text-lg mt-3 leading-relaxed'>
                Passport provides continuous visibility, cryptographic proof, and strict boundaries across every tool, API, and payment your agents execute.
              </p>
            </div>

            {/* Feature Stack (Replaced generic table) */}
            <div className='space-y-3 mt-2'>
              {capabilities.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={index}
                    className='p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all flex items-start gap-4'
                  >
                    <div className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                      <IconComponent className='w-5 h-5' />
                    </div>
                    <div>
                      <h3 className='text-white text-base font-semibold mb-1'>
                        {item.title}
                      </h3>
                      <p className='text-white/60 text-sm leading-relaxed'>
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Portfolio
