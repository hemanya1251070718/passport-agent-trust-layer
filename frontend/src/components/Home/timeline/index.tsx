'use client'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SecurityLifecyclePhoneMockup } from './phone-lifecycle'

const TimeLine = () => {
  const ref = useRef(null)
  const inView = useInView(ref)

  return (
    <section className='md:pt-32 pt-9' id='development'>
      <div className='container lg:px-16 px-4'>
        <div className='text-center'>
          <motion.div
            whileInView={{ y: 0, opacity: 1 }}
            initial={{ y: '-50%', opacity: 0 }}
            transition={{ duration: 0.6 }}>
            <div className='flex flex-col gap-4'>
              <p className='text-white font-medium'>
                Cryptographic <span className='text-primary'>Control Flow</span>
              </p>
              <h2 className='text-white sm:text-5xl text-3xl font-medium lg:w-80% mx-auto mb-16'>
                The 4-Stage Security Lifecycle of Every Agent Errand
              </h2>
            </div>
          </motion.div>

          <motion.div
            whileInView={{ scale: 1, opacity: 1 }}
            initial={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.6 }}>
            <div className='md:block hidden relative'>
              <div className='my-6'>
                <SecurityLifecyclePhoneMockup />
              </div>

              {/* Node 1: Delegation */}
              <div className='absolute lg:top-40 top-36 lg:left-0 -left-20 w-72 flex items-center gap-6'>
                <div className='text-right'>
                  <h3 className='text-muted text-2xl mb-2 font-bold'>1. Delegation</h3>
                  <p className='text-sm text-muted/80'>
                    Principal issues Ed25519 capability token with explicit scopes and TTL
                  </p>
                </div>
                <div className='bg-primary/20 backdrop-blur-xs p-4 h-fit rounded-full border border-primary/30'>
                  <Image
                    src='/images/solution/solution-icon-1.svg'
                    alt='Delegation'
                    width={40}
                    height={40}
                    className='w-10 h-10'
                  />
                </div>
              </div>

              {/* Node 2: Interception */}
              <div className='absolute lg:top-40 top-36 lg:right-0 -right-20 w-72 flex items-center gap-6'>
                <div className='bg-primary/20 backdrop-blur-xs p-4 h-fit rounded-full border border-primary/30'>
                  <Image
                    src='/images/solution/solution-icon-2.svg'
                    alt='Interception'
                    width={40}
                    height={40}
                    className='w-10 h-10'
                  />
                </div>
                <div className='text-left'>
                  <h3 className='text-muted text-2xl mb-2 font-bold'>2. Intercept</h3>
                  <p className='text-sm text-muted/80'>
                    Sub-millisecond regex & SSRF check against default-deny policy rules
                  </p>
                </div>
              </div>

              {/* Node 3: Spend Sandbox */}
              <div className='absolute lg:bottom-48 bottom-36 lg:left-0 -left-20 w-72 flex items-center gap-6'>
                <div className='text-right'>
                  <h3 className='text-muted text-2xl mb-2 font-bold'>3. Sandboxed Spend</h3>
                  <p className='text-sm text-muted/80'>
                    Virtual treasury card enforced per-tx cap ($15) and 24h velocity cap
                  </p>
                </div>
                <div className='bg-primary/20 backdrop-blur-xs p-4 h-fit rounded-full border border-primary/30'>
                  <Image
                    src='/images/solution/solution-icon-3.svg'
                    alt='Spend'
                    width={40}
                    height={40}
                    className='w-10 h-10'
                  />
                </div>
              </div>

              {/* Node 4: Flight Recorder */}
              <div className='absolute lg:bottom-48 bottom-36 lg:right-0 -right-20 w-72 flex items-center gap-6'>
                <div className='bg-primary/20 backdrop-blur-xs p-4 h-fit rounded-full border border-primary/30'>
                  <Image
                    src='/images/solution/solution-icon-4.svg'
                    alt='Flight Recorder'
                    width={40}
                    height={40}
                    className='w-10 h-10'
                  />
                </div>
                <div className='text-left'>
                  <h3 className='text-muted text-2xl mb-2 font-bold'>4. Flight Recorder</h3>
                  <p className='text-sm text-muted/80'>
                    SHA-256 hash-chained Merkle ledger provides non-repudiation and audits
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile View */}
            <div className='md:hidden grid grid-cols-1 gap-6 text-left mt-8'>
              <div className='p-4 bg-white/5 border border-white/10 rounded-xl'>
                <h4 className='font-bold text-primary mb-1'>1. Delegation</h4>
                <p className='text-xs text-white/70'>Principal issues Ed25519 capability token with explicit scopes and TTL</p>
              </div>
              <div className='p-4 bg-white/5 border border-white/10 rounded-xl'>
                <h4 className='font-bold text-primary mb-1'>2. Interception</h4>
                <p className='text-xs text-white/70'>Sub-millisecond regex & SSRF check against default-deny policy rules</p>
              </div>
              <div className='p-4 bg-white/5 border border-white/10 rounded-xl'>
                <h4 className='font-bold text-primary mb-1'>3. Sandboxed Spend</h4>
                <p className='text-xs text-white/70'>Virtual treasury card enforced per-tx cap ($15) and 24h velocity cap</p>
              </div>
              <div className='p-4 bg-white/5 border border-white/10 rounded-xl'>
                <h4 className='font-bold text-primary mb-1'>4. Flight Recorder</h4>
                <p className='text-xs text-white/70'>SHA-256 hash-chained Merkle ledger provides non-repudiation and audits</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default TimeLine;
