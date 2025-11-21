import { NextResponse, NextRequest } from "next/server";
import { CIMSStore, type CIMSDomain } from "@/app/lib/cims/store";

/**
 * GET /api/cims/signals/list?domain=<all|management|hr|finance|operations|marketing>
 *
 * Returns a filtered list of signals by domain.
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
    const items = await CIMSStore.signals.list(domain);
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("GET /api/cims/signals/list failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to load signals list" },
      { status: 500 }
    );
  }
}

/**
 * Optional POST helper for creating demo signals:
 * body: { source?: string, text: string, level?: "info"|"warn"|"critical", domain?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const text = (body?.text ?? "").toString().trim();
    const source = (body?.source ?? "Automate").toString().trim();
    const level = (body?.level ?? "info").toString().trim();
    const domain = parseDomain(body?.domain ?? null);

    if (!text) {
      return NextResponse.json(
        { ok: false, error: "Missing 'text' in request body" },
        { status: 400 }
      );
    }

    const item = {
      id: `sig_${Date.now().toString(36)}`,
      source,
      text,
      level,
      time: new Date().toISOString().slice(11, 16),
      domain,
    };

    await CIMSStore.signals.add(item as any);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("POST /api/cims/signals/list failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to create signal" },
      { status: 500 }
    );
  }
}
