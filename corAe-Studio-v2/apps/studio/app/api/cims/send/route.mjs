// Lightweight JS shim for cims/send — keeps file valid JS so TypeScript doesn't parse TS types here.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    // Basic pass-through stub: real logic lives in route.ts (TypeScript)
    const body = await req.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: true, received: body }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}