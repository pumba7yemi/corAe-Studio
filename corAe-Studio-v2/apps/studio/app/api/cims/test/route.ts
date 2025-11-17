import { NextResponse, NextRequest } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * CIMS TEST ENDPOINT
 *
 * GET  /api/cims/test
 *   → Returns test summary (verifies import + base health)
 *
 * POST /api/cims/test
 *   → Accepts body: { message: string, domain?: string }
 *      - Adds an inbox test message
 *      - Returns confirmation + counts
 *
 * For quick validation of live routes, stores, and dev setup.
 */

export async function GET() {
  try {
    const [inbox, outbox, signals] = await Promise.all([
      CIMSStore.inbox.list("all"),
      CIMSStore.outbox.list("all"),
      CIMSStore.signals.list("all"),
    ]);

    return NextResponse.json({
      ok: true,
      message: "CIMS API test route reachable ✅",
      counts: {
        inbox: inbox.length,
        outbox: outbox.length,
        signals: signals.length,
      },
      hint: "POST { message } to simulate a test inbox item.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Test endpoint failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const msg = (body?.message ?? "").toString().trim();
    const domain = (body?.domain ?? "operations").toString();

    if (!msg) {
      return NextResponse.json(
        { ok: false, error: "Missing 'message' in body" },
        { status: 400 }
      );
    }

    await CIMSStore.inbox.add({
      id: `test_${Date.now().toString(36)}`,
      from: "CIMS Test",
      subject: msg,
      time: new Date().toISOString().slice(11, 16),
      type: "system",
      status: "new",
      domain,
    });

    const inbox = await CIMSStore.inbox.list("all");
    return NextResponse.json({
      ok: true,
      added: msg,
      domain,
      newInboxCount: inbox.length,
    });
  } catch (err) {
    console.error("POST /api/cims/test failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to add test message" },
      { status: 500 }
    );
  }
}
