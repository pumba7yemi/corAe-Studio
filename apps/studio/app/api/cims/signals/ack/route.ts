import { NextResponse, NextRequest } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * POST /api/cims/signals/ack
 * body: { id: string }
 *
 * Reconciled (robust) behavior:
 * - Safe JSON parse & validation
 * - Supports either CIMSStore.signals.ack or .acknowledge (both accepted)
 * - Clear status codes and JSON result
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

    // Prefer `.ack` if present; fall back to `.acknowledge` for older shapes.
    const sig = (CIMSStore as any).signals;
    if (typeof sig?.ack === "function") {
      await sig.ack(id);
    } else if (typeof sig?.acknowledge === "function") {
      await sig.acknowledge(id);
    } else {
      return NextResponse.json(
        { ok: false, error: "Signals store does not support ack/acknowledge" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id, status: "acknowledged" });
  } catch (err) {
    console.error("POST /api/cims/signals/ack failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to acknowledge signal" },
      { status: 500 }
    );
  }
}
