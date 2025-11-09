import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  try {
    const { kind } = JSON.parse(body || "{}");
    // TODO: trigger real workflows (BTDO/BDO/etc.)
    return NextResponse.json({ ok: true, launched: kind ?? "unknown" });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
}
