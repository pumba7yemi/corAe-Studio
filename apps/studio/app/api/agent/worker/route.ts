// apps/studio/app/api/agent/worker/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runDevAgent } from '@/agent/devAgent';
import { loadQueue, saveQueue } from '@/agent/queueStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAllowed(req: NextRequest) {
  const mustCheck = !!process.env.AGENT_KEY;
  if (!mustCheck) return process.env.NODE_ENV !== 'production';
  return (req.headers.get('x-api-key') || '') === process.env.AGENT_KEY;
}

export async function POST(req: NextRequest) {
  if (!isAllowed(req)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const queue = await loadQueue();
  const next = queue.find(q => q.status === 'queued');
  if (!next) return NextResponse.json({ ok: true, message: 'no queued items' });

  try {
  next.status = 'running';
  next.startedAt = new Date().toISOString();
  await saveQueue(queue);

  // Coerce task to a string to avoid TypeScript errors when next.task is
  // possibly `string | undefined`. The agent runner expects a string task
  // name; this keeps behavior conservative (empty string if missing) while
  // unblocking type-checking locally.
  const taskName = String(next.task ?? "");
  const result = await runDevAgent(taskName, next.payload ?? {});
    next.result = result;
    next.status = 'done';
    next.finishedAt = new Date().toISOString();

    await saveQueue(queue);
    return NextResponse.json({ ok: true, processed: next.id, status: next.status, result: next.result });
  } catch (err: any) {
    next.status = 'error';
    next.error = err?.message ?? String(err);
    next.finishedAt = new Date().toISOString();
    await saveQueue(queue);
    return NextResponse.json({ ok: false, processed: next.id, error: next.error }, { status: 500 });
  }
}
