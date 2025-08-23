import { NextResponse } from 'next/server';
import { runDevAgent } from '@/lib/agent/devAgent';

export const runtime = 'nodejs'; // allow fs and Node APIs

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const task = String(body?.task || '');
    const payload = body?.payload ?? {};
    if (!task) {
      return NextResponse.json({ ok: false, error: 'Missing task' }, { status: 400 });
    }

    const result = await runDevAgent(task, payload);
    return NextResponse.json({ ok: true, task, result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
