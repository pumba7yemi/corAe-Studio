export const runtime = 'nodejs';
import type { NextRequest } from 'next/server';
import { listPrayerDocs, savePrayerDoc } from '../../../../../../../../packages/core-faith/library';

export async function GET() {
  const docs = await listPrayerDocs();
  return new Response(JSON.stringify({ docs }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: NextRequest) {
  const doc = await req.json();
  await savePrayerDoc(doc);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
