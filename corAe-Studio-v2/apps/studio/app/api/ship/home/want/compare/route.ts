import { compareOffers } from "@corae/want-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const items = Array.isArray(body) ? body : body?.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "no items provided" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const results = await compareOffers(items as any);
    return new Response(JSON.stringify({ results }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "ok", note: "POST a JSON body { items: [...] } to run compare" }), { status: 200, headers: { "Content-Type": "application/json" } });
}
