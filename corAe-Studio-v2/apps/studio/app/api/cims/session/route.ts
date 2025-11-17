// apps/studio/app/api/cims/session/route.ts
import { NextResponse } from "next/server";

// Deprecated compatibility route. Use /api/cims/sessions (plural) instead.
export async function GET() {
  return NextResponse.json({ ok: false, error: "deprecated: use /api/cims/sessions" }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ ok: false, error: "deprecated: use /api/cims/sessions" }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ ok: false, error: "deprecated: use /api/cims/sessions" }, { status: 410 });
}
