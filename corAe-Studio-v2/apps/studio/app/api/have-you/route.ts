import { NextRequest, NextResponse } from "next/server";
import { checkAll, done, snooze } from "../../../lib/have-you/server";

export async function GET() {
  const results = await checkAll({});
  return NextResponse.json({ ok: true, results });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action, itemId, until } = body as { action: "done" | "snooze"; itemId: string; until?: string };

  if (action === "done" && itemId) {
    const state = await done(itemId);
    return NextResponse.json({ ok: true, state });
  }
  if (action === "snooze" && itemId && until) {
    const state = await snooze(itemId, until);
    return NextResponse.json({ ok: true, state });
  }
  return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
}