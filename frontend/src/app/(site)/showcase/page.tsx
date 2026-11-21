import { TrustHero } from "@/components/trust-triptych";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust Triptych Showcase | Passport Agent Trust Layer",
  description: "Cinematic zero-trust control canvas for autonomous AI agents.",
};

export default function ShowcasePage() {
  return <TrustHero />;
}
