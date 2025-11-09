import { NextResponse, NextRequest } from "next/server";
import { CIMSStore, type CIMSDomain } from "@/app/lib/cims/store";

/**
 * GET /api/cims/outbox/list?domain=<all|management|hr|finance|operations|marketing>
 *
 * Returns a filtered list of outbox items.
 * Defaults to "all" when no domain query param is provided.
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
    const items = await CIMSStore.outbox.list(domain);
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("GET /api/cims/outbox/list failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to load outbox list" },
      { status: 500 }
    );
  }
}

/**
 * Optional POST helper for testing:
 * body: { to: string, subject: string, domain?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const to = (body?.to ?? "").toString().trim();
    const subject = (body?.subject ?? "").toString().trim();
    const domain = parseDomain(body?.domain ?? null);

    if (!to || !subject) {
      return NextResponse.json(
        { ok: false, error: "Missing 'to' or 'subject'" },
        { status: 400 }
      );
    }

    const item = {
      id: `out_${Date.now().toString(36)}`,
      to,
      subject,
      status: "queued",
      time: new Date().toISOString().slice(11, 16),
      domain,
    };

    await CIMSStore.outbox.add(item as any);

    // simulate async send → mark as sent
    setTimeout(() => CIMSStore.outbox.setStatus(item.id, "sent"), 1000);

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("POST /api/cims/outbox/list failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to create outbox item" },
      { status: 500 }
    );
  }
}
