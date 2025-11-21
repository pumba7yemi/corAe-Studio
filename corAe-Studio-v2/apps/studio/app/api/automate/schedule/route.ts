import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // In a real implementation we'd enqueue a job. Return a stub id.
    return NextResponse.json({ ok: true, id: `sched-${Date.now()}` });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
