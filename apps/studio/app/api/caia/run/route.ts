import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const task = String(body?.task || 'intro');

    switch (task) {
      case 'intro':
        return NextResponse.json({
          ok: true,
          message: "I am CAIA — Central AI of corAe. Your operating system’s intelligence.",
        });

      case 'morning-exec':
        return NextResponse.json({
          ok: true,
          briefing: {
            revenue: "AED 12,340 today",
            risks: ["Low stock: PepsiCo bundle", "Pending PO: Iffco Oils"],
            actions: ["Confirm PO with Al Shabab", "Post Big Bite Bundle to WhatsApp"],
          },
        });

      case 'health':
        return NextResponse.json({
          ok: true,
          status: "healthy",
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ ok: false, error: `Unknown task: ${task}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
