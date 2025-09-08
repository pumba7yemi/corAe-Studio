// apps/studio/app/api/caia/ship/ask/route.ts
// Ship-side CAIA: ONLY base brain, no dockyard memory. BBB: INBOUND CAIA_PROMPT
import { NextRequest, NextResponse } from 'next/server';
import { withBBB } from '@/bbb/gate';
import { appendEvent } from '@/build/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AskBody = { prompt: string; wl?: string; user?: string };

async function handler(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as AskBody;
  const prompt = body.prompt?.trim();
  if (!prompt) return NextResponse.json({ ok: false, error: 'No prompt' }, { status: 400 });

  // For now we return a base-brain mock; later plug the actual model with ship-only memory.
  const answer = `🤖 CAIA (Ship) — base brain reply to: "${prompt}"`;

  await appendEvent({
    ts: new Date().toISOString(),
    level: 'INFO',
    scope: 'caia.ship.ask',
    action: 'PROMPT',
    notes: prompt,
    meta: { wl: body.wl || 'unknown', user: body.user || 'anon', replyPreview: answer.slice(0, 80) }
  });

  return NextResponse.json({ ok: true, answer });
}

export const POST = withBBB('INBOUND', 'CAIA_PROMPT', handler);