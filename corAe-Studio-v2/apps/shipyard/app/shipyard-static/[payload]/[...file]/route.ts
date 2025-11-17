// apps/shipyard/app/shipyard-static/[payload]/[...file]/route.ts
import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ payload: string; file: string[] }> }
) {
  const p = await params;
  const root = path.join(process.cwd(), ".ship");
  const safePayload = p.payload.replace(/[^a-zA-Z0-9._-]/g, "");
  const safeRel = (p.file || []).map((s) => s.replace(/[^a-zA-Z0-9._/-]/g, "")).join("/");
  const full = path.join(root, safePayload, safeRel || "index.html");

  try {
    const data = await fs.readFile(full);
    const ext = path.extname(full).toLowerCase();
    const type =
      ext === ".html" ? "text/html" :
      ext === ".css" ? "text/css" :
      ext === ".js" ? "application/javascript" :
      ext === ".json" ? "application/json" :
      ext === ".png" ? "image/png" :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      ext === ".svg" ? "image/svg+xml" :
      "application/octet-stream";

    return new Response(data, { headers: { "Content-Type": type } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
}