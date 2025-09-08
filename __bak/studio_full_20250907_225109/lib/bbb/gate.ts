// apps/studio/lib/bbb/gate.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { appendEvent } from '@/lib/build/log';

type Direction = 'INBOUND' | 'OUTBOUND';
export type FlowKind =
  | 'TELEMETRY'
  | 'LOG'
  | 'CAIA_PROMPT'
  | 'SHIP_APPLY'
  | 'SHIP_UPDATE'
  | 'BRAIN_SEED'
  | 'LEAK'; // intentionally not allowed

type Policy = {
  version: string;
  allow: { inbound: FlowKind[]; outbound: FlowKind[] };
  redact?: { outbound_block_keys?: string[]; inbound_block_keys?: string[] };
};

async function loadPolicy(): Promise<Policy> {
  const p = path.join(process.cwd(), 'build', 'security', 'bbb.policy.json');
  const raw = await fs.readFile(p, 'utf8').catch(() => '');
  if (!raw) {
    return {
      version: 'default',
      allow: { inbound: ['TELEMETRY', 'LOG', 'CAIA_PROMPT', 'SHIP_APPLY'], outbound: ['SHIP_UPDATE', 'BRAIN_SEED'] },
      redact: { outbound_block_keys: ['secrets', 'tokens', 'privateNotes', 'internalDocs', 'userPII'] }
    };
  }
  return JSON.parse(raw);
}

/** Deeply remove any keys that match block list */
function redact(obj: any, keys: string[] = []): any {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((v) => redact(v, keys));
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (keys.includes(k)) continue;
    out[k] = redact(v, keys);
  }
  return out;
}

export async function assertBBB(direction: Direction, kind: FlowKind, payload?: any) {
  const policy = await loadPolicy();
  const allowList = direction === 'INBOUND' ? policy.allow.inbound : policy.allow.outbound;
  const allowed = allowList.includes(kind);
  if (!allowed) {
    await appendEvent({
      ts: new Date().toISOString(),
      level: 'WARN',
      scope: 'bbb',
      action: 'BLOCK',
      notes: `${direction} ${kind}`,
      meta: { direction, kind }
    });
    const e: any = new Error('BBB_BLOCKED');
    e.status = 403;
    throw e;
  }
  const redactKeys = direction === 'OUTBOUND' ? policy.redact?.outbound_block_keys : policy.redact?.inbound_block_keys;
  return redactKeys?.length ? redact(payload, redactKeys) : payload;
}

/** Wrap a Next.js route handler with BBB enforcement */
export function withBBB(direction: Direction, kind: FlowKind, handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // run to trigger allow/block; we don’t need the payload at this layer
      await assertBBB(direction, kind);
      return await handler(req);
    } catch (e: any) {
      const status = e?.status || 403;
      return NextResponse.json({ ok: false, error: 'BBB_BLOCKED' }, { status });
    }
  };
}