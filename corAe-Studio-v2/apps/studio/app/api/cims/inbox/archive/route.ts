import { NextResponse, NextRequest } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * POST /api/cims/inbox/archive
 * body: { id: string }
 *
 * Marks an inbox item as "archived".
 * Alias to the generalized /api/cims/inbox/status endpoint.
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

    await CIMSStore.inbox.setStatus(id, "archived");
    return NextResponse.json({ ok: true, id, status: "archived" });
  } catch (err) {
    console.error("POST /api/cims/inbox/archive failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to archive inbox item" },
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
    info: "POST JSON { id } to archive an inbox item",
    example: { id: "in-1" },
    prefer: {
      method: "POST",
      url: "/api/cims/inbox/status",
      body: { id: "in-1", status: "archived" },
    },
  });
}
