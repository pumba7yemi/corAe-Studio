// apps/studio/app/api/smsme/snapshot/prisma/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { prismaToSnapshot } from "@/lib/prismaToSnapshot";

function findFileUp(start: string, rel: string[], maxUp = 8): string | null {
  let dir = start;
  for (let i = 0; i < maxUp; i++) {
    const p = path.join(dir, ...rel);
    if (fs.existsSync(p)) return p;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export async function POST() {
  try {
    const root = process.cwd();

    // try common locations for Prisma schema
    const candidates = [
      ["prisma", "schema.prisma"],
      ["apps", "api", "prisma", "schema.prisma"],
      ["apps", "studio", "prisma", "schema.prisma"],
      ["src", "prisma", "schema.prisma"]
    ];

    let schemaPath: string | null = null;
    for (const rel of candidates) {
      const p = findFileUp(root, rel);
      if (p) { schemaPath = p; break; }
    }
    if (!schemaPath) throw new Error("schema.prisma not found (looked in prisma/, apps/*/prisma/, src/prisma/)");

    const text = fs.readFileSync(schemaPath, "utf8");
    const snap = prismaToSnapshot(text, "next_from_prisma");

    // write to data/schemas/next.json (vault)
    const dataRoot = path.resolve(root, "../../../data");
    const outDir = path.join(dataRoot, "schemas");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "next.json");
    fs.writeFileSync(outPath, JSON.stringify(snap, null, 2));

    return NextResponse.json({
      ok: true,
      message: "Generated NEXT snapshot from prisma",
      schemaPath: schemaPath.replace(root + path.sep, ""),
      saved: "data/schemas/next.json"
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
