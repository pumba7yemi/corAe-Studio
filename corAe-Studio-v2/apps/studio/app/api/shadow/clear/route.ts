// apps/studio/app/api/shadow/clear/route.ts
// POST endpoint to clear shadow data. Supports clearing a single company or all.
// Clearing all requires an admin secret in env: SHADOW_ADMIN_SECRET.

import { NextResponse } from "next/server";
import { z } from "zod";
import { clearCompany, clearAll, listCompanies } from "../../../lib/shadow/store";

const ADMIN_HEADER = "x-shadow-admin";
const ADMIN_SECRET = process.env.SHADOW_ADMIN_SECRET ?? "";

const BodySchema = z.object({
  action: z.enum(["clearCompany", "clearAll"]),
  companyId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
    }

    const { action, companyId } = parsed.data;

    if (action === "clearCompany") {
      if (!companyId) {
        return NextResponse.json({ ok: false, error: "companyId_required" }, { status: 400 });
      }
      const known = listCompanies();
      if (!known.includes(companyId)) {
        return NextResponse.json({ ok: false, error: "not_found", companyId }, { status: 404 });
      }
      clearCompany(companyId);
      return NextResponse.json({ ok: true, action, companyId });
    }

    // clearAll requires admin secret in either env or header
    const hdr = request.headers.get(ADMIN_HEADER) ?? "";
    if (!ADMIN_SECRET || (!hdr || hdr !== ADMIN_SECRET)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    clearAll();
    return NextResponse.json({ ok: true, action: "clearAll" });
  } catch (err) {
    console.error("[shadow/clear] error:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

// Monkey steps
// 1. To clear a single company (safe):
//    POST /api/shadow/clear  { "action":"clearCompany", "companyId":"demo-co" }
// 2. To clear all (admin): set env SHADOW_ADMIN_SECRET and then:
//    POST /api/shadow/clear  { "action":"clearAll" } with header 'x-shadow-admin: <secret>'
