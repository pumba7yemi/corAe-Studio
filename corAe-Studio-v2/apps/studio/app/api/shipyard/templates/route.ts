// Studio API — Shipyard Templates Registry
// Exposes the root build template catalog for CAIA/Studio.

import { NextResponse } from "next/server";
import { corAeTemplates } from "@/lib/build/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Defensive copy to avoid accidental mutation downstream
  const templates = corAeTemplates.map((t) => ({ ...t }));
  return NextResponse.json({ ok: true, count: templates.length, templates });
}
