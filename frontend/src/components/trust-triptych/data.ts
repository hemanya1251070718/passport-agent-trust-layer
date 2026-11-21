/**
 * Shared types + default (static) values for the Passport trust triptych.
 * Every default mirrors the schemas in the Passport project brief and is meant to be
 * overridden with live values from the existing data layer.
 */

export interface TelemetryFrame {
  /** Policy-kernel evaluation latency, milliseconds, e.g. "0.082" */
  latencyMs: string;
  /** Share of hostile tool calls blocked, percent, e.g. "98.4" */
  blockedPct: string;
  /** Tool-call decisions per second, thousands, e.g. "128" */
  callsK: string;
}

export const DEFAULT_TELEMETRY_BASELINE: TelemetryFrame = {
  latencyMs: "0.082",
  blockedPct: "98.4",
  callsK: "128",
};

/** Decorative hover animation frames. The last frame equals the baseline. */
export const DEFAULT_TELEMETRY_FRAMES: readonly TelemetryFrame[] = [
  { latencyMs: "0.061", blockedPct: "97.1", callsK: "139" },
  { latencyMs: "0.094", blockedPct: "99.0", callsK: "104" },
  { latencyMs: "0.071", blockedPct: "98.2", callsK: "147" },
  { latencyMs: "0.109", blockedPct: "96.8", callsK: "116" },
  { latencyMs: "0.088", blockedPct: "98.9", callsK: "134" },
  { latencyMs: "0.066", blockedPct: "97.6", callsK: "112" },
  { latencyMs: "0.102", blockedPct: "99.3", callsK: "143" },
  { latencyMs: "0.082", blockedPct: "98.4", callsK: "128" },
];

/** "ed25519:7a4f9b2c8e1d3a5f" -> "ed25519:7a4f…3a5f" */
export function shortFingerprint(fingerprint: string): string {
  const [algorithm, hex] = fingerprint.split(":");
  if (!algorithm || !hex || hex.length <= 8) return fingerprint;
  return `${algorithm}:${hex.slice(0, 4)}\u2026${hex.slice(-4)}`;
}

/** Fixed-locale number formatting so server and client markup always match. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}
