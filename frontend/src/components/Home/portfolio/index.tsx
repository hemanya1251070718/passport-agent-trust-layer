'use client'
import Image from 'next/image'
import { portfolioData } from '@/app/api/data'
import { motion } from 'framer-motion'
import { DefenseCardsMockup } from './defense-cards-mockup'

const Portfolio = () => {
  return (
    <section className='pt-24' id='portfolio'>
      <div className='container px-4 sm:px-6'>
        <div className='grid lg:grid-cols-2 items-center gap-16'>
          <motion.div
            whileInView={{ y: 0, opacity: 1 }}
            initial={{ y: '-50%', opacity: 0 }}
            transition={{ duration: 0.6 }}
            className='lg:-ml-12'>
            <DefenseCardsMockup />
          </motion.div>

          <motion.div
            whileInView={{ y: 0, opacity: 1 }}
            initial={{ y: '50%', opacity: 0 }}
            transition={{ duration: 0.6 }}>
            <div className='flex flex-col gap-4'>
              <p className='text-white font-medium'>
                Unified Agent Governance <span className='text-primary'>Architecture</span>
              </p>
              <h2 className='text-white sm:text-5xl text-3xl font-bold leading-tight'>
                Complete Defense-in-Depth for Autonomous Swarms
              </h2>
            </div>
            <p className='text-muted/80 text-lg mt-4'>
              Passport delivers full visibility, cryptographic non-repudiation, and proactive
              guardrails across every tool, API, and financial settlement an agent initiates.
            </p>

            <table className='w-full sm:w-[90%] mt-8'>
              <tbody>
                {portfolioData.map((item, index) => (
                  <tr key={index} className='border-b border-border/50'>
                    <td className='py-4'>
                      <div className='bg-primary/20 p-2.5 rounded-xl w-fit border border-primary/30'>
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={22}
                          height={22}
                        />
                      </div>
                    </td>
                    <td className='py-4'>
                      <h3 className='text-muted text-base ml-4 font-medium'>
                        {item.title}
                      </h3>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Portfolio;
