// Deprecated: moved to /api/ship/home/faith/library
export async function GET() {
  return new Response(JSON.stringify({ ok:false, error: 'moved', note: 'Use /api/ship/home/faith/library' }), { status: 410, headers: { 'Content-Type': 'application/json' } });
}

export async function POST() {
  return new Response(JSON.stringify({ ok:false, error: 'moved', note: 'Use /api/ship/home/faith/library' }), { status: 410, headers: { 'Content-Type': 'application/json' } });
}
