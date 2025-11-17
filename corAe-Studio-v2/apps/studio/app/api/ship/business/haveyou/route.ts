import { NextRequest, NextResponse } from "next/server";
import { register, list, runTick } from "../../haveyou/scheduler";
import { HaveYou } from "../../haveyou/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tick = searchParams.get("tick");
  if (tick) return NextResponse.json(runTick());
  return NextResponse.json({ ok: true, items: list("BUSINESS") });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (body.action === "bulkUpsert") {
    register(body.items as HaveYou[], "BUSINESS");
    return NextResponse.json({ ok: true, count: body.items?.length ?? 0 });
  }
  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}