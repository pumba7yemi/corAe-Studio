import { NextResponse, NextRequest } from "next/server";
import { CIMSStore, type CIMSDomain } from "@/app/lib/cims/store";

/**
 * GET /api/cims/inbox/list?domain=<all|management|hr|finance|operations|marketing>
 *
 * Returns a list of inbox items filtered by domain.
 * Defaults to "all" when no domain is specified.
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
    const items = await CIMSStore.inbox.list(domain);
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("GET /api/cims/inbox/list failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to load inbox list" },
      { status: 500 }
    );
  }
}

/**
 * Optional POST helper for creating demo inbox entries quickly.
 * body: { subject: string, from?: string, domain?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const subject = (body?.subject ?? "").toString().trim();
    const from = (body?.from ?? "Automate").toString().trim();
    const domain = parseDomain(body?.domain ?? null);

    if (!subject) {
      return NextResponse.json(
        { ok: false, error: "Missing subject" },
        { status: 400 }
      );
    }

    const item = {
      id: `in_${Date.now().toString(36)}`,
      from,
      subject,
      time: new Date().toISOString().slice(11, 16),
      type: "automate",
      status: "new",
      domain,
    };

    await CIMSStore.inbox.add(item as any);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("POST /api/cims/inbox/list failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to create inbox item" },
      { status: 500 }
    );
  }
}
