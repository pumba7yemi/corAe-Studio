// Deprecated: moved to /api/ship/home/faith/journal
export async function POST() {
  return new Response(JSON.stringify({ ok: false, error: 'moved', note: 'Use /api/ship/home/faith/journal' }), { status: 410, headers: { 'Content-Type': 'application/json' } });
}

export async function GET() {
  return new Response(JSON.stringify({ ok: false, error: 'moved', note: 'Use /api/ship/home/faith/journal' }), { status: 410, headers: { 'Content-Type': 'application/json' } });
}
