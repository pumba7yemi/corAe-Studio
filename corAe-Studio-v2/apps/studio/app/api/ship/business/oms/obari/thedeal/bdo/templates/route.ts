// apps/studio/app/api/business/oms/obari/thedeal/bdo/templates/route.ts
import { NextResponse } from "next/server";
import { join } from "path";
import { cwd } from "process";
import { pathToFileURL } from "url";

export async function GET() {
  const baseDir = join(cwd(), "packages", "bdo-core", "templates");
  // Try to import the package normally first; if the package export mapping
  // confuses the bundler, fall back to loading the built dist file via file:// URL.
  let mod: any = null;
  try {
    mod = await import("@corae/bdo-core");
  } catch {
    const p = join(cwd(), "packages", "bdo-core", "dist", "index.js");
    const url = pathToFileURL(p).href;
    mod = await import(url);
  }

  const loader = mod?.loadSectorTemplates ?? mod?.default?.loadSectorTemplates;
  const data = loader(baseDir);
  return NextResponse.json({ ok: true, sectors: data });
}

