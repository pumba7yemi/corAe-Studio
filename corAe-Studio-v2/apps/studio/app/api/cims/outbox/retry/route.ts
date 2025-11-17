import { NextResponse, NextRequest } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * POST /api/cims/outbox/retry
 * body: { id: string }
 *
 * Reconciled 150% logic:
 * - Validates JSON safely
 * - Immediate UX feedback: set → "queued"
 * - Fire-and-forget fake send: flip to "sent" shortly after
 * - Clear error messages and HTTP statuses
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

    // 1) immediate feedback
    await CIMSStore.outbox.setStatus(id, "queued");

    // 2) simulate async delivery (non-blocking)
    queueMicrotask(async () => {
      try {
        await new Promise((r) => setTimeout(r, 800));
        await CIMSStore.outbox.setStatus(id, "sent");
      } catch {
        // leave it as 'queued' on failure
      }
    });

    return NextResponse.json({ ok: true, id, status: "queued" });
  } catch (err) {
    console.error("POST /api/cims/outbox/retry failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to retry outbox item" },
      { status: 500 }
    );
  }
}
