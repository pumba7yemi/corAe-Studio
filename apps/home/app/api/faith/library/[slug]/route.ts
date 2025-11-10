// Deprecated: use /api/ship/home/faith/library/[slug]
export async function GET() {
  return new Response(JSON.stringify({ ok:false, error: 'moved', note: 'Use /api/ship/home/faith/library/[slug]' }), { status: 410, headers: { 'Content-Type': 'application/json' } });
}
