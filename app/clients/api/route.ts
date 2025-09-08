// Next.js App Router route handler (Edge-friendly)
export async function GET() {
  return new Response(JSON.stringify({ module: "clients", ok: true }), {
    headers: { "content-type": "application/json" },
  });
}
