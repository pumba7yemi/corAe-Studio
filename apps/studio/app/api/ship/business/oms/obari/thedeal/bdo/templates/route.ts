// apps/studio/app/api/ship/business/oms/obari/thedeal/bdo/templates/route.ts
import { NextResponse } from "next/server";
import { loadSectorTemplates } from "@corae/bdo-core";
import { join } from "path";
import { cwd } from "process";

export async function GET() {
  const baseDir = join(cwd(), "packages", "bdo-core", "templates");
  const data = loadSectorTemplates(baseDir);
  return NextResponse.json({ ok: true, sectors: data });
}
