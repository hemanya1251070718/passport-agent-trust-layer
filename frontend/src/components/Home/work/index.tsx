'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Zap, Lock, Terminal } from 'lucide-react'
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

  const services = [
    {
      icon: Shield,
      text: 'Ed25519 Cryptographic Delegation & Identity',
    },
    {
      icon: Zap,
      text: 'Sub-Millisecond Policy & SSRF Interception',
    },
    {
      icon: Lock,
      text: 'Sandboxed Spend Velocity & Treasury Controls',
    },
    {
      icon: Terminal,
      text: 'SHA-256 Tamper-Evident Flight Recorder',
    },
  ]

  return (
    <section className='py-16' id='work'>
      <div className='container px-4 mx-auto lg:max-w-(--breakpoint-xl)'>
        <div ref={ref} className='grid grid-cols-12 items-center gap-12'>
          <motion.div
            {...bottomAnimation}
            className='lg:col-span-7 col-span-12'>
            <div className='flex flex-col gap-3'>
              <p className="text-white font-medium">
                Why Swarms Need <span className='text-primary'>Passport</span>
              </p>
              <h2 className='sm:text-5xl text-3xl text-white lg:w-full md:w-70% font-medium leading-tight'>
                Zero-Trust Control Plane for Autonomous AI Agents
              </h2>
              <p className="text-white/70 text-base mt-2">
                Unbounded agency is an existential security risk. Passport provides the boundary
                layer: preventing runaway card charges, prompt injection privilege escalation,
                internal network probing, and rogue unauthorized actions.
              </p>
            </div>
            <div className='grid md:grid-cols-2 gap-6 mt-10'>
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <div key={index} className='flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10'>
                    <div className='p-3 bg-primary/15 rounded-xl text-primary shrink-0'>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <p className='text-white font-medium text-sm'>{service.text}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
          <motion.div {...TopAnimation} className='lg:col-span-5 col-span-12'>
            <div className='mt-9 flex justify-center'>
              <SwarmTelemetryMockup />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Work;
