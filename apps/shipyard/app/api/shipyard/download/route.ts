// apps/shipyard/app/api/shipyard/download/route.ts
import { NextResponse } from "next/server";
import path from "node:path";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";

const ROOT = path.join(process.cwd(), "..", "..");
const DIST_DIR = path.join(ROOT, "dist");

export async function GET(req: Request) {
  const url = new URL(req.url);
  const file = url.searchParams.get("file");
  if (!file) return NextResponse.json({ ok: false, error: "file required" }, { status: 400 });

  const p = path.join(DIST_DIR, file);
  try {
    await fs.access(p);
  } catch {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const stream = createReadStream(p);
  return new Response(stream as any, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${file}"`,
    },
  });
}