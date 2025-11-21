// apps/studio/app/api/ship/haveyou/tick/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runTick } from "../scheduler";
import type { Scope } from "../types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all   = searchParams.get("all");
  const scope = searchParams.get("scope") as Scope | null;

  if (all) {
    const scopes: Scope[] = ["HOME", "WORK", "BUSINESS"];
    const results = Object.fromEntries(scopes.map(s => [s, runTick(s)]) as any);
    const total = scopes.reduce((n, s) => n + (results[s].triggered?.length ?? 0), 0);
    return NextResponse.json({ ok: true, total, results });
  }

  const s: Scope = (scope ?? "HOME") as Scope;
  const res = runTick(s);
  return NextResponse.json({ ok: true, scope: s, ...res });
}