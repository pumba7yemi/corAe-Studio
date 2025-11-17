// apps/studio/app/api/shadow/ingest/route.ts
// Accepts external mirror events and stores them in the in-memory Shadow Store.
// Non-invasive: no DB writes. Optional HMAC verification if SHADOW_HMAC_SECRET is set.

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { appendEvent, type ShadowEventBase } from "../../../lib/shadow/store";

const HMAC_HEADER = "x-corae-signature"; // hex(hmacSha256(rawBody))
const HMAC_SECRET = process.env.SHADOW_HMAC_SECRET ?? "";

const isoDate = z
  .string()
  .min(1)
  .refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid ISO timestamp" });

const EventType = z.enum([
  "order.created",
  "order.paid",
  "inventory.adjusted",
  "product.updated",
  "staff.clock",
  "booking.created",
  "payment.captured",
  "refund.issued",
  "customer.updated",
  "meta.note",
]);

const BodySchema = z.object({
  companyId: z.string().min(1),
  id: z.string().optional(),
  type: EventType,
  occurredAt: isoDate,
  source: z.string().min(1),
  // use string-keyed record for compatibility with the project's Zod typings
  payload: z.record(z.string(), z.unknown()).default({}),
});

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function hmacHex(secret: string, raw: string): string {
  return crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();

    // Optional HMAC check
    if (HMAC_SECRET) {
      const sig = request.headers.get(HMAC_HEADER) ?? "";
      const expected = hmacHex(HMAC_SECRET, raw);
      if (!sig || !safeEqual(sig, expected)) {
        return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
      }
    }

    let json: unknown;
    try {
      json = JSON.parse(raw || "{}");
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "validation_error", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { companyId, id, type, occurredAt, source, payload } = parsed.data;
    const receivedAt = new Date().toISOString();

    const event: ShadowEventBase = {
      id: id || crypto.randomUUID(),
      type,
      occurredAt,
      receivedAt,
      source,
      payload,
    };

    const { count } = appendEvent(companyId, event);

    return NextResponse.json({ ok: true, companyId, count, receivedAt });
  } catch (err) {
    console.error("[shadow/ingest] error:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}


// Monkey steps
// 1. Create folders: apps/studio/app/api/shadow/ingest/
// 2. Create file route.ts in that folder (this file).
// 3. Paste the full code above and save.
// 4. (Optional) add to your .env → SHADOW_HMAC_SECRET="change-me"
// 5. Test locally (no HMAC):
//    curl -sS -X POST http://localhost:3000/api/shadow/ingest \
//      -H 'content-type: application/json' \
//      -d '{"companyId":"demo-co","type":"order.created","occurredAt":"2025-11-07T10:00:00Z","source":"custom","payload":{"orderId":"A123","total":99.5}}'

// Expected result: { ok:true, companyId:"demo-co", count:1, receivedAt:"…" }
