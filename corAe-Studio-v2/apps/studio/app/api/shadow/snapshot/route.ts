// apps/studio/app/api/shadow/snapshot/route.ts
// Read-only snapshot endpoint for the in-memory Shadow Mirror store.
// GET /api/shadow/snapshot?companyId=demo-co
// If companyId is omitted, returns the list of known companies.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSnapshot, listCompanies } from "../../../lib/shadow/store";

const QuerySchema = z.object({
  companyId: z.string().min(1).optional(),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const companyIdRaw = url.searchParams.get("companyId") ?? undefined;
    const parsed = QuerySchema.safeParse({ companyId: companyIdRaw?.trim() });
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
    }

    const companyId = parsed.data.companyId;
    if (!companyId) {
      const companies = listCompanies();
      return NextResponse.json({ ok: true, companies, count: companies.length });
    }

    const companies = listCompanies();
    if (!companies.includes(companyId)) {
      return NextResponse.json({ ok: false, error: "not_found", companyId }, { status: 404 });
    }

    const snapshot = getSnapshot(companyId);
    return NextResponse.json({ ok: true, snapshot });
  } catch (err) {
    console.error("[shadow/snapshot] error:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

// Monkey steps
// 1. Request a list of companies: GET /api/shadow/snapshot
// 2. Request a company snapshot: GET /api/shadow/snapshot?companyId=demo-co
// 3. Returned payloads are read-only reflections of the in-memory store.
