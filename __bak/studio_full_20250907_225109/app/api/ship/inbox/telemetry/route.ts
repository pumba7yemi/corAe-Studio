// apps/studio/app/api/ship/inbox/telemetry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { withBBB } from '@/lib/bbb/gate';
import { appendEvent } from '@/lib/build/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest) {
  const payload = await req.json().catch(() => ({}));
  const day = new Date().toISOString().slice(0, 10);
  const dir = path.join(process.cwd(), 'build', '.data', 'ship', 'telemetry');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${day}.jsonl`);
  await fs.appendFile(file, JSON.stringify({ ts: new Date().toISOString(), payload }) + '\n', 'utf8');

  await appendEvent({
    ts: new Date().toISOString(),
    level: 'INFO',
    scope: 'bbb',
    action: 'INGEST_TELEMETRY',
    meta: { file }
  });

  return NextResponse.json({ ok: true });
}

export const POST = withBBB('INBOUND', 'TELEMETRY', handler);