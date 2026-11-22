#!/usr/bin/env python3
"""
Passport High-Concurrency Load & Latency Benchmark (Phase 5: Days 11-12)
Stress-tests the policy evaluation engine and Ed25519 cryptographic verification
under high concurrent load (1,000 requests) to benchmark p50, p95, and p99 latency SLA.
"""

import sys
import os
import time
import asyncio
import math
from typing import List, Dict, Any

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.crypto import CryptoEngine
from backend.app.services.policy_engine import PolicyEngine
from backend.app.models.schemas import ToolEvaluationRequest

async def run_stress_benchmark(num_requests: int = 1000, concurrency: int = 50) -> Dict[str, Any]:
    print("=" * 65)
    print(f"PASSPORT HIGH-CONCURRENCY LATENCY BENCHMARK ({num_requests} EVALUATIONS)")
    print(f"Concurrency: {concurrency} workers | Target SLA: p50 < 1.00 ms")
    print("=" * 65)

    crypto = CryptoEngine.get_instance()
    policy = PolicyEngine.get_instance()

    # Pre-mint test delegation tokens for realistic crypto verification load
    token_valid, _, _ = crypto.mint_token(
        principal_id="user_admin",
        agent_id="bench_agent_01",
        scopes=["web:scrape", "vendor:verify", "wallet:pay"],
        budget_limit=500.0,
        per_tx_limit=25.0
    )

    token_restricted, _, _ = crypto.mint_token(
        principal_id="user_admin",
        agent_id="bench_agent_restricted",
        scopes=["web:scrape"],
        budget_limit=10.0,
        per_tx_limit=5.0
    )

    # 4 distinct request templates representing production traffic mix
    templates = [
        # 1. Legitimate scrape (ALLOW)
        ToolEvaluationRequest(
            agent_id="bench_agent_01",
            delegation_token=token_valid,
            tool_name="olostep_scrape",
            parameters={"url": "https://homingo.com/docs"}
        ),
        # 2. Legitimate vendor verify (ALLOW)
        ToolEvaluationRequest(
            agent_id="bench_agent_01",
            delegation_token=token_valid,
            tool_name="crustdata_verify",
            parameters={"company_name": "stripe.com"}
        ),
        # 3. Hostile SSRF attempt (DENY - sub-millisecond interdiction)
        ToolEvaluationRequest(
            agent_id="bench_agent_01",
            delegation_token=token_valid,
            tool_name="olostep_scrape",
            parameters={"url": "http://169.254.169.254/latest/meta-data/"}
        ),
        # 4. Scope escalation attack (DENY - restricted agent attempting payment)
        ToolEvaluationRequest(
            agent_id="bench_agent_restricted",
            delegation_token=token_restricted,
            tool_name="wallet_spend",
            parameters={"amount": 8.50, "merchant": "aws.amazon.com"}
        ),
    ]

    kernel_latencies_ms: List[float] = []
    pipeline_latencies_ms: List[float] = []
    decisions = {"ALLOW": 0, "DENY": 0, "REQUIRE_APPROVAL": 0}
    
    semaphore = asyncio.Semaphore(concurrency)

    async def evaluate_single(idx: int):
        req = templates[idx % len(templates)]
        async with semaphore:
            start = time.perf_counter()
            resp = await policy.evaluate_action(req)
            elapsed_ms = (time.perf_counter() - start) * 1000.0
            pipeline_latencies_ms.append(elapsed_ms)
            if resp.kernel_latency_ms is not None:
                kernel_latencies_ms.append(resp.kernel_latency_ms)
            elif resp.decision_latency_ms is not None:
                kernel_latencies_ms.append(resp.decision_latency_ms)
            else:
                kernel_latencies_ms.append(elapsed_ms)
            decisions[resp.decision] = decisions.get(resp.decision, 0) + 1

    total_start = time.perf_counter()
    tasks = [evaluate_single(i) for i in range(num_requests)]
    await asyncio.gather(*tasks)
    total_elapsed = time.perf_counter() - total_start

    # Compute statistics helper
    def compute_stats(arr: List[float]) -> Dict[str, float]:
        s = sorted(arr)
        n = len(s)
        def pct(p: float) -> float:
            idx = min(int(round((p / 100.0) * n)), n - 1)
            return float(s[idx])
        return {
            "p50": round(pct(50), 4),
            "p90": round(pct(90), 4),
            "p95": round(pct(95), 4),
            "p99": round(pct(99), 4),
            "mean": round(float(sum(s) / n), 4),
            "min": round(float(s[0]), 4),
            "max": round(float(s[-1]), 4)
        }

    k_stats = compute_stats(kernel_latencies_ms)
    p_stats = compute_stats(pipeline_latencies_ms)
    rps = num_requests / total_elapsed

    report = {
        "total_requests": num_requests,
        "concurrency": concurrency,
        "total_time_seconds": round(total_elapsed, 4),
        "throughput_rps": round(rps, 2),
        "kernel_latency_ms": k_stats,
        "pipeline_latency_ms": p_stats,
        "decisions": decisions,
        "kernel_sla_met": bool(k_stats["p50"] < 1.00)
    }

    print(f"Total Evaluations:   {num_requests}")
    print(f"Total Duration:      {total_elapsed:.3f} seconds")
    print(f"Throughput:          {rps:,.1f} requests/second")
    print("-" * 65)
    print("1. DECISION KERNEL LATENCY (Crypto Verification + Policy Guardrails)")
    print(f"   p50 Latency:      {k_stats['p50']:.3f} ms   (< 1ms SLA: {'PASSED [OK]' if k_stats['p50'] < 1.0 else 'FAILED'})")
    print(f"   p90 Latency:      {k_stats['p90']:.3f} ms")
    print(f"   p95 Latency:      {k_stats['p95']:.3f} ms")
    print(f"   p99 Latency:      {k_stats['p99']:.3f} ms")
    print(f"   Mean / Min / Max: {k_stats['mean']:.3f} ms / {k_stats['min']:.3f} ms / {k_stats['max']:.3f} ms")
    print("-" * 65)
    print("2. END-TO-END PIPELINE LATENCY (Including Persistent SQLite WAL Commit)")
    print(f"   p50 Latency:      {p_stats['p50']:.3f} ms")
    print(f"   p95 Latency:      {p_stats['p95']:.3f} ms")
    print(f"   p99 Latency:      {p_stats['p99']:.3f} ms")
    print("-" * 65)
    print(f"Decisions Breakdown: {decisions}")
    print("=" * 65)

    return report

if __name__ == "__main__":
    asyncio.run(run_stress_benchmark(num_requests=1000, concurrency=20))
