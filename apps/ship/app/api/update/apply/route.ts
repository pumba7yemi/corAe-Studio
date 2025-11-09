// apps/ship/app/api/update/apply/route.ts
import { NextRequest } from "next/server";

function getAdminSecret() {
  return (
    process.env.SHIP_UPDATE_ADMIN_SECRET ||
    process.env.SHIP_SHADOW_ADMIN_SECRET ||
    process.env.SHADOW_ADMIN_SECRET ||
    ""
  );
}

export async function POST(req: NextRequest) {
  const adminSecret = getAdminSecret();
  // Accept either legacy "x-admin-secret" or the smoke-test header "x-corae-admin-secret"
  const headerSecret = req.headers.get("x-admin-secret") || req.headers.get("x-corae-admin-secret") || "";

  if (!adminSecret || headerSecret !== adminSecret) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Placeholder “apply” stub (extend to run your real update logic)
  let payload: unknown = null;
  try { payload = await req.json(); } catch {}

  return new Response(
    JSON.stringify({
      ok: true,
      route: "update/apply",
      received: payload ?? {},
      applied: true,
      ts: new Date().toISOString(),
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}
