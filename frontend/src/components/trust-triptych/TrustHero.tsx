"use client";

import Link from "next/link";
import { AccountabilityCard, type AccountabilityCardProps } from "./AccountabilityCard";
import { IdentityCard, type IdentityCardProps } from "./IdentityCard";
import { PolicyKernelCard, type PolicyKernelCardProps } from "./PolicyKernelCard";
import { useViewportContain } from "./useStageFit";
import "./trust-triptych.css";

const CANVAS_WIDTH = 1690;
const CANVAS_HEIGHT = 950;
const STACK_BELOW = 700;

export interface TrustHeroProps {
  identity?: IdentityCardProps;
  policy?: PolicyKernelCardProps;
  accountability?: AccountabilityCardProps;
}

/**
 * Full-viewport cinematic hero: a fixed 1690×950 design canvas, uniformly scaled to fit
 * (never cropped) at 700px and wider, reflowing into one column below 700px.
 */
export function TrustHero({ identity, policy, accountability }: TrustHeroProps) {
  const fit = useViewportContain(CANVAS_WIDTH, CANVAS_HEIGHT, STACK_BELOW);

  return (
    <div
      className="pt-hero"
      data-stacked={fit.stacked}
      data-narrow={fit.narrow}
      style={{ visibility: fit.ready ? "visible" : "hidden" }}
    >
      <div
        className="pt-canvas"
        style={
          fit.stacked
            ? undefined
            : { transform: `translate(-50%, -50%) scale(${fit.scale})` }
        }
      >
        <section className="pt-shell" aria-labelledby="pt-page-title">
          <header className="pt-nav">
            <div className="pt-brand" aria-label="Passport home">
              <span className="pt-brand-mark" aria-hidden="true" />
              <span>Passport</span>
            </div>
            <nav className="pt-nav-links" aria-label="Primary navigation">
              <Link href="/dashboard">Console</Link>
              <span aria-hidden="true">·</span>
              <Link href="/documentation">Docs</Link>
            </nav>
          </header>

          <div className="pt-intro">
            <h1 id="pt-page-title">
              <span className="pt-headline-sans">Zero-trust control for</span>
              <span className="pt-headline-serif">autonomous agents.</span>
            </h1>
            <p>
              The control plane between agents and their tools — delegate scoped passes,
              <br className="pt-desktop-break" /> enforce policy in under a millisecond, and
              prove every decision.
            </p>
          </div>

          <section className="pt-cards" aria-label="Passport trust layer">
            <IdentityCard {...identity} />
            <PolicyKernelCard {...policy} />
            <AccountabilityCard {...accountability} />
          </section>
        </section>
      </div>
    </div>
  );
}
