export const runtime = 'nodejs';
import type { NextRequest } from 'next/server';
import { saveJournal } from '../../../../../../../../packages/core-faith/journal';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ok = await saveJournal(body);
  return new Response(JSON.stringify(ok), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
