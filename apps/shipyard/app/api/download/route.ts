import { NextRequest } from "next/server";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // ZIPs live in root/dist (two levels up from apps/shipyard)
  const ROOT = path.join(process.cwd(), "..", "..");
  const distDir = path.join(ROOT, "dist");

  const url = new URL(req.url);
  const file = url.searchParams.get("file");
  if (!file) {
    return new Response("Missing ?file=", { status: 400 });
  }

  // Only allow .zip files inside root/dist
  const abs = path.join(distDir, file);
  const rel = path.relative(distDir, abs);
  const safe = !rel.startsWith("..") && file.endsWith(".zip");
  if (!safe) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    await fsp.access(abs, fs.constants.R_OK);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const stream = fs.createReadStream(abs);
  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${path.basename(abs)}"`,
      "Cache-Control": "no-store"
    }
  });
}