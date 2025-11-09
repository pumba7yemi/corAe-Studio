// apps/studio/app/api/files/[bucket]/upload/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

function ensureDir(p: string) { fs.mkdirSync(p, { recursive: true }); }
function sanitize(name: string) { return name.replace(/[^\w.\-]/g, "_"); }

export async function POST(
  req: Request,
  ctx: { params: Promise<{ bucket: string }> }
) {
  const params = await ctx.params;
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const filename = (form.get("filename") as string) || (file?.name ?? "upload.bin");
    const bucket = sanitize(params.bucket || "uploads");

    if (!file) throw new Error("No file");
    const arrayBuffer = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    const root = process.cwd();
    const dataRoot = path.resolve(root, "../../../data"); // walk up from apps/studio/app/...
    const destDir = path.join(dataRoot, bucket);
    ensureDir(destDir);

    const safeName = sanitize(filename);
    const destPath = path.join(destDir, safeName);
    fs.writeFileSync(destPath, buf);

    return NextResponse.json({
      ok: true,
      bucket,
      filename: safeName,
      path: destPath.replace(root + path.sep, ""), // relative-ish for display
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 400 });
  }
}