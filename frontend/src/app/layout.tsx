import { DM_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import { ThemeProvider } from 'next-themes'
import ScrollToTop from '@/components/ScrollToTop'
import Aoscompo from '@/utils/aos'
import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'react-hot-toast'

const font = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'Passport — Trust, Identity & Control Layer for Autonomous AI Agents',
  description: 'The zero-trust control plane for agent swarms: Ed25519 identity delegation, default-deny policy guardrails, sandboxed multi-currency spend velocity limits, and SHA-256 verifiable audit flight recorder.',
  keywords: ['AI agents', 'agent trust', 'Ed25519 delegation', 'policy engine', 'agent wallet', 'audit flight recorder', 'MCP security', 'Homingo'],
  openGraph: {
    title: 'Passport — Trust, Identity & Control Layer for Autonomous AI Agents',
    description: 'The zero-trust control plane for agent swarms. Cryptographic delegation, sub-millisecond policy engine, sandboxed spend, and SHA-256 hash-chained flight recorder.',
    url: 'https://passport-trust-gateway-58223756937.asia-south1.run.app',
    siteName: 'Passport',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${font.className} ${font.variable}`}>
        <ThemeProvider
          attribute='class'
          enableSystem={true}
          defaultTheme='system'>
          <AuthProvider>
            <Toaster position="top-right" />
            <Aoscompo>
              <Header />
              {children}
              <Footer />
            </Aoscompo>
            <ScrollToTop />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
