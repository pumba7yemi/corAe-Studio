// app/api/ship/download/route.ts
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const file = url.searchParams.get("file");
  if (!file) {
    return new Response("Missing ?file=", { status: 400 });
  }

  // only allow files in ./dist and only zips
  const distDir = path.join(process.cwd(), "dist");
  const abs = path.join(distDir, file);
  const relCheck = path.relative(distDir, abs);
  if (relCheck.startsWith("..") || !file.endsWith(".zip")) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!fs.existsSync(abs)) {
    return new Response("Not found", { status: 404 });
  }

  const stream = fs.createReadStream(abs);
  return new Response(stream as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${path.basename(abs)}"`
    }
  });
}
