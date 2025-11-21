import { NextResponse, NextRequest } from "next/server";
import { CIMSStore, type CIMSDomain } from "@/app/lib/cims/store";

/**
 * GET /api/cims/outbox?domain=<all|management|hr|finance|operations|marketing>
 *   → { ok: true, items: OutboxItem[] }
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
  const domain = parseDomain(req.nextUrl.searchParams.get("domain"));
  const items = await CIMSStore.outbox.list(domain);
  return NextResponse.json({ ok: true, items });
}
