// app/api/cims/check/route.ts
import { NextResponse } from "next/server";

/**
 * CIMS self-check endpoint
 *
 * GET /api/cims/check
 * → Pings core CIMS routes and returns a consolidated status report.
 *
 * What it probes:
 *  - /api/cims/version
 *  - /api/cims/health
 *  - /api/cims/inbox?domain=all
 *  - /api/cims/outbox?domain=all
 *  - /api/cims/signals?domain=all
 */

type ProbeResult = {
  url: string;
  ok: boolean;
  status: number;
  elapsedMs: number;
  body?: unknown;
  error?: string;
};

async function probe(url: string): Promise<ProbeResult> {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { cache: "no-store" });
    const elapsedMs = Date.now() - t0;
    const status = res.status;
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch {
      // ignore parse errors; some endpoints might not return JSON
    }
    return { url, ok: res.ok, status, elapsedMs, body };
  } catch (err: any) {
    return {
      url,
      ok: false,
      status: 0,
      elapsedMs: Date.now() - t0,
      error: err?.message ?? "fetch failed",
    };
  }
}

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;

  const targets = [
    `${origin}/api/cims/version`,
    `${origin}/api/cims/health`,
    `${origin}/api/cims/inbox?domain=all`,
    `${origin}/api/cims/outbox?domain=all`,
    `${origin}/api/cims/signals?domain=all`,
  ];

  const results = await Promise.all(targets.map(probe));

  const summary = {
    ok: results.every((r) => r.ok),
    total: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
  };

  return NextResponse.json({
    ok: summary.ok,
    summary,
    results,
    timestamp: new Date().toISOString(),
  });
}
