export const runtime = 'nodejs';
import { getPrayerDoc } from '../../../../../../../../../packages/core-faith/library';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const slug = parts[parts.length - 1];
  const doc = await getPrayerDoc(slug);
  if (!doc) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ doc }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
