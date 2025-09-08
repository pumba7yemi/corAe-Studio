import { NextRequest, NextResponse } from 'next/server';
import { appendEvent } from '@/build/log';
import { appendDockyardMemory } from '@/caia/memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AskBody = { prompt: string; user?: string };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AskBody;
    const prompt = (body.prompt || '').trim();
    if (!prompt) return NextResponse.json({ ok: false, error: 'No prompt given' }, { status: 400 });

    // toy answer for now (plug model later)
    const answer = `🤖 CAIA (Dockyard): "${prompt}" → acknowledged`;

    // growth memory (private)
    await appendDockyardMemory({ ts: new Date().toISOString(), role: 'user', text: prompt, user: body.user || 'owner' });
    await appendDockyardMemory({ ts: new Date().toISOString(), role: 'assistant', text: answer, user: 'CAIA' });

    // build log
    await appendEvent({
      ts: new Date().toISOString(),
      level: 'INFO',
      scope: 'caia.ask',
      action: 'PROMPT',
      notes: prompt,
      meta: { replyPreview: answer.slice(0, 80), user: body.user || 'owner' }
    });

    return NextResponse.json({ ok: true, answer });
  } catch (e: any) {
    await appendEvent({
      ts: new Date().toISOString(),
      level: 'ERROR',
      scope: 'caia.ask',
      action: 'PROMPT',
      notes: e?.message || 'Unknown error'
    });
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}