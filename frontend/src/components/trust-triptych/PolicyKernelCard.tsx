"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import {
  DEFAULT_TELEMETRY_BASELINE,
  DEFAULT_TELEMETRY_FRAMES,
  type TelemetryFrame,
} from "./data";
import "./trust-triptych.css";

const FRAME_INTERVAL_MS = 105;

export interface PolicyKernelCardProps {
  /** Live values shown at rest and restored when the hover animation stops. */
  baseline?: TelemetryFrame;
  /** Frames cycled on hover/focus. Purely decorative. */
  frames?: readonly TelemetryFrame[];
  /** Small label top-right of the card. */
  siteLabel?: string;
}

export function PolicyKernelCard({
  baseline = DEFAULT_TELEMETRY_BASELINE,
  frames = DEFAULT_TELEMETRY_FRAMES,
  siteLabel = "policy.kernel",
}: PolicyKernelCardProps) {
  const [frameIndex, setFrameIndex] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const stop = useCallback((): void => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setFrameIndex(null);
  }, []);

  const start = useCallback((): void => {
    if (timerRef.current !== null || frames.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;
    setFrameIndex(0);
    timerRef.current = window.setInterval(() => {
      index = (index + 1) % frames.length;
      setFrameIndex(index);
    }, FRAME_INTERVAL_MS);
  }, [frames]);

  useEffect(() => {
    const onVisibility = (): void => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [stop]);

  const shown: TelemetryFrame =
    frameIndex === null ? baseline : (frames[frameIndex] ?? baseline);

  return (
    <article
      className="pt-card pt-card-middle"
      aria-label="Real-time policy enforcement"
      tabIndex={0}
      onPointerEnter={start}
      onFocus={start}
      onPointerLeave={stop}
      onBlur={stop}
    >
      <Eye className="pt-card-icon" strokeWidth={2.1} aria-hidden="true" />
      <span className="pt-card-site">{siteLabel}</span>

      <div className="pt-orbit" aria-hidden="true">
        <span className="pt-orbit-dot-bottom" />
      </div>
      <div className="pt-sphere" aria-hidden="true" />

      <span className="pt-glass-pill pt-latency">
        <i className="pt-dot" />
        <span className="pt-telemetry-number">{shown.latencyMs}</span>&nbsp; ms · eval
      </span>
      <span className="pt-glass-pill pt-blocked">
        <i className="pt-dot" />
        <span className="pt-telemetry-number">{shown.blockedPct}</span>&nbsp; % blocked
      </span>
      <span className="pt-glass-pill pt-calls">
        <i className="pt-dot violet" />
        <span className="pt-telemetry-number">{shown.callsK}</span>&nbsp; k calls/s
      </span>

      <p className="pt-card-copy">Every tool call inspected before it touches the wire.</p>
    </article>
  );
}
