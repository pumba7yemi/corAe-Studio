// apps/studio/app/api/bbb/leak/route.ts
// Demonstrates a blocked outbound attempt.
import { withBBB } from '@/bbb/gate';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler() {
  // If BBB works, this never runs — withBBB blocks before.
  return NextResponse.json({ ok: true, message: 'This should not appear if BBB is enabled.' });
}

export const GET = withBBB('OUTBOUND', 'LEAK', handler);