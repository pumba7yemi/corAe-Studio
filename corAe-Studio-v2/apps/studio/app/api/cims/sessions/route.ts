// apps/studio/app/api/cims/sessions/route.ts
import { NextResponse } from "next/server";
import { CimsSession } from "@/app/lib/cims/session";

/**
 * corAe CIMS Sessions API
 * ------------------------
 * GET  → Return current active user + all users
 * POST → Switch session to another user by ID
 */

export async function GET() {
  try {
    const [active, users] = await Promise.all([
      CimsSession.current(),
      CimsSession.list(),
    ]);
    return NextResponse.json({ ok: true, active, users });
  } catch (err) {
    console.error("GET /api/cims/sessions failed:", err);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing id" },
        { status: 400 }
      );
    }

    const switched = await CimsSession.switchTo(id);
    if (!switched) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, active: switched });
  } catch (err) {
    console.error("POST /api/cims/sessions failed:", err);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // clear simulated session
    if (typeof (CimsSession as any).clear === "function") {
      await (CimsSession as any).clear();
      return NextResponse.json({ ok: true, user: null });
    }
    // fallback: no-op
    return NextResponse.json({ ok: true, user: null });
  } catch (err) {
    console.error("DELETE /api/cims/sessions failed:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
