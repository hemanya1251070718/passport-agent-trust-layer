"use client";

import type { ReactNode } from "react";
import { useContainerFit } from "./useStageFit";
import "./trust-triptych.css";

export interface ScaledStageProps {
  /** Width of the fixed design composition, in px. */
  designWidth: number;
  /** Height of the fixed design composition, in px. */
  designHeight: number;
  /** Reflow into a stacked column when the host is narrower than this (0 = never). */
  stackBelow?: number;
  /** Upper bound for the scale factor (1 = never enlarge past design size). */
  maxScale?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Renders a fixed-size composition uniformly scaled to fit its container, so the
 * pixel-positioned trust cards keep their exact layout inside the app shell.
 */
export function ScaledStage({
  designWidth,
  designHeight,
  stackBelow = 0,
  maxScale = 1,
  className,
  children,
}: ScaledStageProps) {
  const { hostRef, fit } = useContainerFit(designWidth, stackBelow, maxScale);

  return (
    <div
      ref={hostRef}
      className={`pt-stage-host${className ? ` ${className}` : ""}`}
      data-stacked={fit.stacked}
      data-narrow={fit.narrow}
      style={{ visibility: fit.ready ? "visible" : "hidden" }}
    >
      <div
        className="pt-stage-box"
        style={
          fit.stacked
            ? undefined
            : {
                width: designWidth * fit.scale,
                height: designHeight * fit.scale,
              }
        }
      >
        <div
          className="pt-stage"
          style={
            fit.stacked
              ? undefined
              : {
                  width: designWidth,
                  height: designHeight,
                  transform: `scale(${fit.scale})`,
                }
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
