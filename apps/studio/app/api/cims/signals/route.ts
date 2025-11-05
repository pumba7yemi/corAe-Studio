// app/api/cims/signals/route.ts
import { NextResponse, NextRequest } from "next/server";
import { CIMSStore, type CIMSDomain } from "@/app/lib/cims/store";

/**
 * GET /api/cims/signals?domain=<all|management|hr|finance|operations|marketing>
 *   → { ok: true, items: SignalItem[] }
 *
 * Domain is optional; defaults to "all".
 */

function parseDomain(raw: string | null): CIMSDomain | "all" {
  switch (raw) {
    case "management":
    case "hr":
    case "finance":
    case "operations":
    case "marketing":
    case "all":
      return raw;
    default:
      return "all";
  }
}

export async function GET(req: NextRequest) {
  try {
    const domain = parseDomain(req.nextUrl.searchParams.get("domain"));
    const items = await CIMSStore.signals.list(domain);
    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Failed to load signals" },
      { status: 500 }
    );
  }
}