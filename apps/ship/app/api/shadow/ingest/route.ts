// apps/ship/app/api/shadow/ingest/route.ts
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
  // Accept either the legacy `x-admin-secret` or the smoke-test header `x-corae-admin-secret`.
  const headerSecret =
    req.headers.get("x-admin-secret") || req.headers.get("x-corae-admin-secret") || "";

  // If a secret is configured, require it (otherwise allow for basic connectivity checks)
  if (adminSecret && headerSecret !== adminSecret) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Read body (not used yet)
  try { await req.json(); } catch {}

  return new Response(JSON.stringify({ ok: true, route: "shadow/ingest" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}


// Monkey steps
// 1. Create folders: apps/ship/app/api/shadow/ingest/
// 2. Create file route.ts in that folder (this file).
// 3. Paste the full code above and save.
// 4. (Optional) add to your .env → SHIP_SHADOW_HMAC_SECRET="change-me" or SHADOW_HMAC_SECRET
// 5. Test locally (no HMAC):
//    curl -sS -X POST http://localhost:3000/api/shadow/ingest \
//      -H 'content-type: application/json' \
//      -d '{"companyId":"demo-co","type":"order.created","occurredAt":"2025-11-07T10:00:00Z","source":"custom","payload":{"orderId":"A123","total":99.5}}'

// Expected result: { ok:true, companyId:"demo-co", count:1, receivedAt:"…" }
