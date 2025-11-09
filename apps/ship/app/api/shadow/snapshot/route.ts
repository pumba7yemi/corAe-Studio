// apps/ship/app/api/shadow/snapshot/route.ts
// GET endpoint to list companies or return a company's shadow snapshot.

import { NextResponse } from "next/server";
import { listCompanies, getSnapshot } from "../../../lib/shadow/store";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const companyId = url.searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ ok: true, companies: listCompanies() });
    }

    const snapshot = getSnapshot(companyId);
    return NextResponse.json({ ok: true, snapshot });
  } catch (err) {
    console.error("[ship/shadow/snapshot] error:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

// Monkey steps
// 1. Create folders: apps/ship/app/api/shadow/snapshot/
// 2. Create file route.ts in that folder (this file).
// 3. Save and test: GET /api/shadow/snapshot or /api/shadow/snapshot?companyId=demo-co
