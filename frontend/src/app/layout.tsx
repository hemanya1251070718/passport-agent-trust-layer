import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Passport | The Trust & Control Layer for AI Agents",
  description: "Okta + Stripe Limits + Tamper-Evident Flight Recorder for Autonomous AI Agents. Built for Homingo Hack Days Edition 01.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#030712] text-zinc-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        {children}
      </body>
    </html>
  );
}
