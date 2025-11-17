import { NextResponse, NextRequest } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * Alias endpoint for legacy clients:
 * POST /api/cims/inbox/approve
 * body: { id: string }
 *
 * Internally maps to: CIMSStore.inbox.setStatus(id, "approved")
 * Prefer the generalized: POST /api/cims/inbox/status  { id, status }
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

    await CIMSStore.inbox.setStatus(id, "approved");
    return NextResponse.json({ ok: true, id, status: "approved" });
  } catch (err) {
    console.error("POST /api/cims/inbox/approve failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to approve inbox item" },
      { status: 500 }
    );
  }
}

/**
 * Optional GET helper for manual discovery in a browser.
 */
export async function GET() {
  return NextResponse.json({
    ok: false,
    info: "POST JSON { id } to approve an inbox item",
    example: { id: "in-1" },
    prefer: {
      method: "POST",
      url: "/api/cims/inbox/status",
      body: { id: "in-1", status: "approved" },
    },
  });
}
