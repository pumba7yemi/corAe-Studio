// apps/studio/app/api/obari/deal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runDevAgent } from '@/agent/devAgent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await runDevAgent('obari.broker.create-deal', body);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 400 });
  }
}
