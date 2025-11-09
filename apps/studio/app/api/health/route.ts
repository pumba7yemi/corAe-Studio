/* Aggregates health from Ship + Studio endpoints */
import { NextResponse } from "next/server";

const SHIP_BASE = process.env.SHIP_BASE_URL || "http://127.0.0.1:3000";
const STUDIO_BASE = process.env.STUDIO_BASE_URL || "http://127.0.0.1:3001";

async function safeJson(url: string, timeoutMs = 2500) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctl.signal, cache: "no-store" });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function GET() {
  const [ship, morning, updateCheck] = await Promise.all([
    safeJson(`${SHIP_BASE}/api/health`),
    safeJson(`${STUDIO_BASE}/api/morning-exec`),
    safeJson(`${SHIP_BASE}/api/update/check?clientVersion=0.0.1`),
  ]);

  const body = {
    ship: ship?.ok ? "ok" : ship ? "down" : "unknown",
    morningExec: morning?.status === "PASS" ? "pass" : morning ? "fail" : "unknown",
    updates: updateCheck ?? null,
    ts: new Date().toISOString(),
  };

  return NextResponse.json(body, { headers: { "cache-control": "no-store" } });
}
// FILE: apps/studio/app/api/health/route.ts
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET_DB() {
  try {
    await prisma.$connect(); // why: surfaces connection/config issues early
    const latest = await prisma.health.findFirst({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, latest });
  } catch (e: any) {
    // return a debuggable payload instead of a generic 500
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e), stack: e?.stack },
      { status: 500 },
    );
  }
}