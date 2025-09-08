// app/api/build/log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readEvents, logEvent } from '@/build/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/build/log  → return latest events
export async function GET() {
  const events = await readEvents(300);
  return NextResponse.json({ ok: true, events });
}

// POST /api/build/log → append one event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    await logEvent({
      ts: new Date().toISOString(),
      level: (body.level ?? 'INFO') as 'INFO' | 'WARN' | 'ERROR',
      scope: (body.scope ?? 'manual') as string,
      action: (body.action ?? 'NOTE') as string,
      file: body.file,
      notes: body.notes,
      meta: body.meta ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Bad request' },
      { status: 400 }
    );
  }
}