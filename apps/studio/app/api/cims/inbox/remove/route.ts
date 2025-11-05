// app/api/cims/inbox/remove/route.ts
import { NextResponse, NextRequest } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * POST /api/cims/inbox/remove
 * body: { id: string }
 *
 * 150%-logic safe handler:
 * - Validates request body
 * - Removes inbox item by id
 * - Returns confirmation
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

    await CIMSStore.inbox.remove(id);
    return NextResponse.json({ ok: true, id, status: "removed" });
  } catch (err) {
    console.error("POST /api/cims/inbox/remove failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to remove inbox item" },
      { status: 500 }
    );
  }
}