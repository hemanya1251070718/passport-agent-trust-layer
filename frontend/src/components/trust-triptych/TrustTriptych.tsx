import { AccountabilityCard, type AccountabilityCardProps } from "./AccountabilityCard";
import { IdentityCard, type IdentityCardProps } from "./IdentityCard";
import { PolicyKernelCard, type PolicyKernelCardProps } from "./PolicyKernelCard";
import { ScaledStage } from "./ScaledStage";
import "./trust-triptych.css";

export interface TrustTriptychProps {
  identity?: IdentityCardProps;
  policy?: PolicyKernelCardProps;
  accountability?: AccountabilityCardProps;
  /** Container width (px) below which the three cards stack. Default 880. */
  stackBelow?: number;
  className?: string;
}

/** The three signature cards as one 1344×586 strip, scaled to its container. */
export function TrustTriptych({
  identity,
  policy,
  accountability,
  stackBelow = 880,
  className,
}: TrustTriptychProps) {
  return (
    <ScaledStage designWidth={1344} designHeight={586} stackBelow={stackBelow} className={className}>
      <section className="pt-cards" aria-label="Passport trust layer">
        <IdentityCard {...identity} />
        <PolicyKernelCard {...policy} />
        <AccountabilityCard {...accountability} />
      </section>
    </ScaledStage>
  );
}
