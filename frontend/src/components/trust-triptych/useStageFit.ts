"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export interface StageFit {
  /** False until the first measurement; callers hide the stage until then. */
  ready: boolean;
  scale: number;
  /** True when the composition must reflow into a single stacked column. */
  stacked: boolean;
  /** True on very narrow viewports/containers (<= 410px). */
  narrow: boolean;
}

const INITIAL_FIT: StageFit = { ready: false, scale: 1, stacked: false, narrow: false };
const NARROW_MAX = 410;

function sameFit(a: StageFit, b: StageFit): boolean {
  return (
    a.ready === b.ready &&
    a.stacked === b.stacked &&
    a.narrow === b.narrow &&
    Math.abs(a.scale - b.scale) < 0.0005
  );
}

/**
 * Viewport "contain" fit for the full-bleed hero canvas.
 * Math.min keeps the whole design visible at every aspect ratio (never crops).
 */
export function useViewportContain(
  designWidth: number,
  designHeight: number,
  stackBelow: number,
): StageFit {
  const [fit, setFit] = useState<StageFit>(INITIAL_FIT);

  useEffect(() => {
    const measure = (): void => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const stacked = width < stackBelow;
      const next: StageFit = {
        ready: true,
        stacked,
        narrow: width <= NARROW_MAX,
        scale: stacked ? 1 : Math.min(width / designWidth, height / designHeight),
      };
      setFit((prev) => (sameFit(prev, next) ? prev : next));
    };

    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [designWidth, designHeight, stackBelow]);

  return fit;
}

/**
 * Container-width fit for stages embedded inside the app shell (dashboard, agents, ...).
 * Scales to the host's width, never above `maxScale`, and stacks below `stackBelow` px.
 */
export function useContainerFit(
  designWidth: number,
  stackBelow: number,
  maxScale: number,
): { hostRef: RefObject<HTMLDivElement | null>; fit: StageFit } {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState<StageFit>(INITIAL_FIT);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const measure = (): void => {
      const width = host.clientWidth;
      if (width === 0) return;
      const stacked = stackBelow > 0 && width < stackBelow;
      const next: StageFit = {
        ready: true,
        stacked,
        narrow: width <= NARROW_MAX,
        scale: stacked ? 1 : Math.min(maxScale, width / designWidth),
      };
      setFit((prev) => (sameFit(prev, next) ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [designWidth, stackBelow, maxScale]);

  return { hostRef, fit };
}
