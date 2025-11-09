// apps/studio/app/api/agent/run/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runDevAgent } from '@/lib/agent/devAgent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---- tiny auth helper -----------------------------------------------
function isAllowed(req: NextRequest) {
  // If AGENT_KEY is not set, allow everything in dev to keep you moving.
  const mustCheck = !!process.env.AGENT_KEY;
  if (!mustCheck) return process.env.NODE_ENV !== 'production';

  const hdr = req.headers.get('x-api-key') || '';
  return hdr === process.env.AGENT_KEY;
}
// ---------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    if (!isAllowed(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { task, payload } = await req.json();
    const result = await runDevAgent(String(task), payload ?? {});
    return NextResponse.json({ ok: true, task, result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}