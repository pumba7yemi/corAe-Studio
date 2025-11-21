// apps/studio/app/api/task-sheets/log/route.ts
import { NextResponse } from 'next/server';
import { logTaskEvent, type TaskEventInput } from '../../../../../../packages/workfocus-core/tasksheets/log';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TaskEventInput;
    // minimal guard
    if (!body?.orgId || !body?.scope || !body?.kind || !body?.title || !body?.source) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }
    const evt = logTaskEvent(body);
    return NextResponse.json({ ok: true, data: evt });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Invalid payload' }, { status: 400 });
  }
}