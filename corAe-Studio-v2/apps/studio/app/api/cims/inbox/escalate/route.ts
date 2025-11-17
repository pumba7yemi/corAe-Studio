import { NextResponse, NextRequest } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * POST /api/cims/inbox/escalate
 * body: { id: string }
 *
 * Marks an inbox item as "escalated".
 * Aliased endpoint for convenience — same logic as /api/cims/inbox/status.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const id = (body?.id ?? "").toString().trim();

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing 'id' in request body" },
        { status: 400 }
      );
    }

    await CIMSStore.inbox.setStatus(id, "escalated");
    return NextResponse.json({ ok: true, id, status: "escalated" });
  } catch (err) {
    console.error("POST /api/cims/inbox/escalate failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to escalate inbox item" },
      { status: 500 }
    );
  }
}

/**
 * Optional GET helper for manual discovery in browser.
 */
export async function GET() {
  return NextResponse.json({
    ok: false,
    info: "POST JSON { id } to escalate an inbox item",
    example: { id: "in-1" },
    prefer: {
      method: "POST",
      url: "/api/cims/inbox/status",
      body: { id: "in-1", status: "escalated" },
    },
  });
}
