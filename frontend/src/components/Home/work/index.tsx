'use client'

import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { KeyRound, ShieldAlert, CreditCard, FileCheck2 } from 'lucide-react'
import { SwarmTelemetryMockup } from './swarm-telemetry-mockup'

const Work = () => {
  const ref = useRef(null)
  const inView = useInView(ref)

  const TopAnimation = {
    initial: { y: '-100%', opacity: 0 },
    animate: inView ? { y: 0, opacity: 1 } : { y: '-100%', opacity: 0 },
    transition: { duration: 0.6, delay: 0.4 },
  }

  const bottomAnimation = {
    initial: { y: '100%', opacity: 0 },
    animate: inView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 },
    transition: { duration: 0.6, delay: 0.4 },
  }

  const pillars = [
    {
      icon: KeyRound,
      title: 'Scoped Delegation Passes',
      desc: 'Issue short-lived keys bounded to explicit tools, endpoints, and TTLs.',
    },
    {
      icon: ShieldAlert,
      title: 'Sub-Millisecond Guardrails',
      desc: 'Intercept tool calls, SSRF probes, and prompt injections in 0.082ms.',
    },
    {
      icon: CreditCard,
      title: 'Hard Budget Boundaries',
      desc: 'Virtual cards enforce per-task ($15) and daily ($50) financial limits.',
    },
    {
      icon: FileCheck2,
      title: 'Immutable Flight Recorder',
      desc: 'Append-only SHA-256 hash chains guarantee non-repudiable audit logs.',
    },
  ]

  return (
    <section className='py-20' id='work'>
      <div className='container mx-auto px-4 lg:max-w-7xl'>
        <div ref={ref} className='grid grid-cols-1 lg:grid-cols-12 items-center gap-12'>
          <motion.div
            {...bottomAnimation}
            className='lg:col-span-7 col-span-12'>
            <div className='flex flex-col gap-3'>
              <p className="text-primary text-sm font-semibold uppercase tracking-wider">
                Boundary Defense for Swarms
              </p>
              <h2 className='sm:text-5xl text-3xl text-white font-bold leading-tight'>
                Zero-Trust Control Plane for Autonomous AI Agents
              </h2>
              <p className="text-white/70 text-base sm:text-lg mt-3 leading-relaxed">
                Give autonomous agents the authority to execute real-world tasks without exposing your internal cloud metadata, proprietary APIs, or company cards to runaway charges and privilege escalation.
              </p>
            </div>
            <div className='grid sm:grid-cols-2 gap-4 mt-8'>
              {pillars.map((pillar, index) => {
                const IconComponent = pillar.icon;
                return (
                  <div key={index} className='p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all'>
                    <div className='flex items-center gap-3 mb-2'>
                      <div className='p-2 bg-primary/15 rounded-lg text-primary shrink-0'>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h3 className='text-white font-semibold text-sm'>{pillar.title}</h3>
                    </div>
                    <p className='text-white/60 text-xs leading-relaxed pl-9'>
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
          <motion.div {...TopAnimation} className='lg:col-span-5 col-span-12'>
            <div className='flex justify-center'>
              <SwarmTelemetryMockup />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Work;
