import { NextRequest, NextResponse } from "next/server";
import { register, list, runTick } from "./scheduler";
import { HaveYou } from "./types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") as HaveYou["scope"] | null;
  const tick = searchParams.get("tick");
  if (tick) return NextResponse.json(runTick());
  return NextResponse.json({ ok: true, items: list(scope ?? undefined) });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (body.action === "bulkUpsert") {
    register(body.items as HaveYou[], body.scope ?? "HOME");
    return NextResponse.json({ ok: true, count: body.items?.length ?? 0 });
  }
  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}