// apps/shipyard/app/api/shipyard/promote/route.ts
import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import AdmZip from "adm-zip";

const ROOT = path.join(process.cwd(), "..", "..");
const DIST_DIR = path.join(ROOT, "dist");
const SHIP_DIR = path.join(process.cwd(), ".ship");

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = String(form.get("file") || "");
    if (!file) {
      return NextResponse.json({ ok: false, error: "file required" }, { status: 400 });
    }
    const src = path.join(DIST_DIR, file);
    // ensure exists
    await fs.access(src);

    // clear / create payload dir
    const payloadDir = `payload-${Date.now()}`;
    const outDir = path.join(SHIP_DIR, payloadDir);
    await fs.rm(outDir, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(outDir, { recursive: true });

    // unzip
    const zip = new AdmZip(src);
    zip.extractAllTo(outDir, true);

    // write manifest
    await fs.mkdir(SHIP_DIR, { recursive: true });
    const manifest = {
      sourceFile: file,
      promotedAt: new Date().toISOString(),
      payloadDir,
    };
    await fs.writeFile(path.join(SHIP_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

    return NextResponse.json({ ok: true, manifest });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "promote failed" }, { status: 500 });
  }
}