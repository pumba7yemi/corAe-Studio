import { NextResponse, NextRequest } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * POST /api/cims/inbox/status
 * body: { id: string, status: "approved" | "escalated" | "archived" | "new" }
 *
 * 150%-logic:
 * - Safe JSON parse
 * - Strong validation with explicit allowed statuses
 * - Updates inbox item status via CIMSStore.inbox.setStatus
 * - Clear, consistent response payload
 *
 * Optional GET explains usage when opened in a browser.
 */

type AllowedStatus = "new" | "approved" | "escalated" | "archived";
const ALLOWED: AllowedStatus[] = ["new", "approved", "escalated", "archived"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const id = (body?.id ?? "").toString().trim();
    const raw = (body?.status ?? "").toString().trim().toLowerCase();

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing 'id' in request body" },
        { status: 400 }
      );
    }

    if (!ALLOWED.includes(raw as AllowedStatus)) {
      return NextResponse.json(
        { ok: false, error: "Invalid 'status'", allowed: ALLOWED },
        { status: 400 }
      );
    }

    await CIMSStore.inbox.setStatus(id, raw as AllowedStatus);
    return NextResponse.json({ ok: true, id, status: raw });
  } catch (err) {
    console.error("POST /api/cims/inbox/status failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to update inbox status" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: false,
    info:
      "Use POST with JSON body { id, status } to update an inbox item status.",
    allowed: ALLOWED,
    examples: [
      { id: "in-1", status: "approved" },
      { id: "in-1", status: "escalated" },
      { id: "in-1", status: "archived" },
      { id: "in-1", status: "new" },
    ],
  });
}
