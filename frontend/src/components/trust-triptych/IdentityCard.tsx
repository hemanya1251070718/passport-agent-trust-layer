import { Fingerprint } from "lucide-react";
import { formatCount, shortFingerprint } from "./data";
import "./trust-triptych.css";

export interface IdentityCardProps {
  /** Agent shown in the top-left pill, e.g. "agent_errand_01". */
  agentId?: string;
  /** Full Ed25519 key fingerprint, e.g. "ed25519:7a4f9b2c8e1d3a5f". */
  fingerprint?: string;
  /** Number of additional active passes beyond the one shown. */
  additionalPasses?: number;
}

export function IdentityCard({
  agentId = "agent_errand_01",
  fingerprint = "ed25519:7a4f9b2c8e1d3a5f",
  additionalPasses = 11,
}: IdentityCardProps) {
  return (
    <article className="pt-card pt-card-left" aria-label="Cryptographic agent identity" tabIndex={0}>
      <div className="pt-left-surface" aria-hidden="true" />
      <Fingerprint className="pt-card-icon" strokeWidth={2.1} aria-hidden="true" />

      <span className="pt-glass-pill pt-pill-agent">{agentId}</span>
      <span className="pt-glass-pill pt-pill-key">{shortFingerprint(fingerprint)}</span>
      <span className="pt-glass-pill pt-live">
        <i className="pt-dot" />
        <span className="pt-live-copy">Passes live</span>
      </span>
      <span className="pt-glass-pill pt-pill-passes">
        +{formatCount(additionalPasses)} active passes
      </span>

      <h2 className="pt-card-title">
        Ephemeral identity for <strong>every autonomous agent.</strong>
      </h2>
    </article>
  );
}
