// app/api/cims/inbox/route.ts
import { NextResponse, NextRequest } from "next/server";
// Use the project alias without /app
import { CIMSStore, type CIMSDomain } from "../../../lib/cims/store";

/**
 * GET /api/cims/inbox?domain=<all|management|hr|finance|operations|marketing>
 *   → { ok: true, items: InboxItem[] }
 *
 * Domain query is optional; defaults to "all".
 * If an unknown value is passed, we coerce to "all".
 */

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("domain") as
    | CIMSDomain
    | "all"
    | null;

  const domain: CIMSDomain | "all" =
    q === "management" ||
    q === "hr" ||
    q === "finance" ||
    q === "operations" ||
    q === "marketing" ||
    q === "all"
      ? q
      : "all";

  const items = await CIMSStore.inbox.list(domain);
  return NextResponse.json({ ok: true, items });
}
