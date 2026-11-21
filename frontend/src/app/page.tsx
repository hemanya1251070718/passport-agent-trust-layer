
import { Metadata } from 'next'
import Hero from '@/components/Home/Hero'
import { TrustTriptych } from '@/components/trust-triptych'
import TelemetryPeak from '@/components/Home/TelemetryPeak'
import Work from '@/components/Home/work'
import TimeLine from '@/components/Home/timeline'
import Platform from '@/components/Home/platform'
import Portfolio from '@/components/Home/portfolio'
import Upgrade from '@/components/Home/upgrade'
import Perks from '@/components/Home/perks'
import GlobalReach from '@/components/Home/GlobalReach'
import Faq from '@/components/Home/Faq'

export const metadata: Metadata = {
  title: 'Passport — Trust Layer for Autonomous AI Agents',
}

export default function Home() {
  return (
    <main>
      <Hero />
      <section className="container max-w-7xl mx-auto px-4 my-16">
        <TrustTriptych
          identity={{
            agentId: "agent_errand_01",
            fingerprint: "ed25519:7a4f9b2c8e1d3a5f",
            additionalPasses: 11,
          }}
          policy={{
            baseline: {
              latencyMs: "0.082",
              blockedPct: "98.4",
              callsK: "128",
            },
          }}
          accountability={{
            pendingApproval: { amountUsd: 28.5 },
            chain: { blocks: 1048, intact: true },
          }}
        />
      </section>
      <TelemetryPeak />
      <Work />
      <GlobalReach/>
      <TimeLine />
      <Platform />
      <Portfolio />
      <Upgrade />
      <Perks />
      <Faq/>
    </main>
  )
}
