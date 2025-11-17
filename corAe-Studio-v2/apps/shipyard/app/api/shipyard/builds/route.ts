// apps/shipyard/app/api/shipyard/builds/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "..", "..");
const DIST_DIR = path.join(ROOT, "dist");

function parse(file: string) {
  const lower = file.toLowerCase();
  let kind: "white-label" | "core" = "core";
  if (lower.startsWith("wl-") || lower.includes("white")) kind = "white-label";
  const m = lower.match(/(\d+\.\d+\.\d+(-[\w.]+)?)/);
  return { kind, version: m?.[1] as string | undefined };
}

export async function GET() {
  try {
    const entries = await fs.readdir(DIST_DIR, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile() && e.name.endsWith(".zip"));
    const items = await Promise.all(
      files.map(async (f) => {
        const p = path.join(DIST_DIR, f.name);
        const s = await fs.stat(p);
        const meta = parse(f.name);
        return { name: f.name, size: s.size, mtime: s.mtimeMs, ...meta };
      })
    );
    items.sort((a, b) => b.mtime - a.mtime);
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 500 });
  }
}