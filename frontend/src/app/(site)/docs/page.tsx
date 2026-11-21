import { Documentation } from '@/components/Documentation/Documentation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Developer Documentation | Passport Agent Trust Layer',
  description: 'Quickstart, Python SDK, MCP Server, and API reference for Passport.',
}

export default function DocsPage() {
  return (
    <main className='pt-24 min-h-screen bg-background'>
      <Documentation />
    </main>
  )
}
