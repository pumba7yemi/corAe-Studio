// apps/studio/app/api/ship/updates/publish/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
import { withBBB } from '@/bbb/gate';
import { appendEvent } from '@/build/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PublishBody = {
  version: string;
  notes?: string;
  artifacts?: Array<{ path: string; sha256: string }>;
};

async function handler(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as PublishBody;
  if (!body.version) {
    return NextResponse.json({ ok: false, error: 'version required' }, { status: 400 });
  }

  const dir = path.join(process.cwd(), 'build', '.data', 'updates');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `publish-${Date.now()}.json`);
  await fs.writeFile(file, JSON.stringify(body, null, 2), 'utf8');

  await appendEvent({
    ts: new Date().toISOString(),
    level: 'INFO',
    scope: 'bbb',
    action: 'SHIP_UPDATE',
    notes: `published ${body.version}`,
    meta: { file, artifacts: (body.artifacts || []).length }
  });

  return NextResponse.json({ ok: true, file });
}

export const POST = withBBB('OUTBOUND', 'SHIP_UPDATE', handler);
