import { Activity } from "lucide-react";
import { formatCount, formatUsd } from "./data";
import "./trust-triptych.css";

export interface PendingApprovalSummary {
  /** Requested spend awaiting a human decision, in USD. */
  amountUsd: number;
}

export interface AuditChainSummary {
  blocks: number;
  /** Result of the latest SHA-256 hash-chain verification. */
  intact: boolean;
}

export interface AccountabilityCardProps {
  /** Highest-priority pending HITL approval, or null when the queue is clear. */
  pendingApproval?: PendingApprovalSummary | null;
  chain?: AuditChainSummary;
}

export function AccountabilityCard({
  pendingApproval = { amountUsd: 28.5 },
  chain = { blocks: 1048, intact: true },
}: AccountabilityCardProps) {
  return (
    <article className="pt-card pt-card-right" aria-label="Verifiable accountability" tabIndex={0}>
      <Activity className="pt-card-icon" strokeWidth={2.3} aria-hidden="true" />
      <div className="pt-status-band" aria-hidden="true" />

      <div className="pt-status-stack">
        {pendingApproval ? (
          <div className="pt-status">
            <i className="pt-dot yellow" />
            <span>Spend {formatUsd(pendingApproval.amountUsd)} held for approval</span>
            <em>pending</em>
          </div>
        ) : (
          <div className="pt-status">
            <i className="pt-dot" />
            <span>No spend awaiting approval</span>
            <em>clear</em>
          </div>
        )}

        {chain.intact ? (
          <div className="pt-status">
            <i className="pt-dot" />
            <span>Flight recorder hash chain</span>
            <em>{formatCount(chain.blocks)} intact</em>
          </div>
        ) : (
          <div className="pt-status pt-status-alert">
            <i className="pt-dot rose" />
            <span>Flight recorder hash chain</span>
            <em>tamper detected</em>
          </div>
        )}
      </div>

      <h2 className="pt-card-title">Accountable.</h2>
    </article>
  );
}
