// apps/ship/app/api/shadow/clear/route.ts
// POST endpoint to clear a single company or clear all companies from the Ship Shadow store.
// Clearing all companies requires an admin secret header: x-corae-admin-secret

import { NextResponse } from "next/server";
import { z } from "zod";
import { clearCompany, clearAll } from "../../../lib/shadow/store";

const ADMIN_HEADER = "x-corae-admin-secret";
const ADMIN_SECRET = process.env.SHIP_SHADOW_ADMIN_SECRET ?? process.env.SHADOW_ADMIN_SECRET ?? "";

const BodySchema = z.object({
  action: z.enum(["clearCompany", "clearAll"]),
  companyId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
    }

    const { action, companyId } = parsed.data;

    if (action === "clearCompany") {
      if (!companyId) {
        return NextResponse.json({ ok: false, error: "companyId_required" }, { status: 400 });
      }
      clearCompany(companyId);
      return NextResponse.json({ ok: true, cleared: "company", companyId });
    }

    // clearAll requires admin secret header
    const provided = request.headers.get(ADMIN_HEADER) ?? "";
    if (!ADMIN_SECRET || !provided || provided !== ADMIN_SECRET) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    clearAll();
    return NextResponse.json({ ok: true, cleared: "all" });
  } catch (err) {
    console.error("[ship/shadow/clear] error:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

// Monkey steps
// 1. Create folders: apps/ship/app/api/shadow/clear/
// 2. Create file route.ts in that folder (this file).
// 3. Save. To clear all, include header: -H "x-corae-admin-secret: <secret>" where <secret> matches SHIP_SHADOW_ADMIN_SECRET or SHADOW_ADMIN_SECRET.
