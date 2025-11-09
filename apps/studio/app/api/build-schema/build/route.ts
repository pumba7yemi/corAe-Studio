// Build: combine prisma/schemas/*.prisma -> prisma/schema.prisma
import { NextResponse } from "next/server";
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    const appRoot = process.cwd();                   // apps/studio
    const folder   = resolve(appRoot, "prisma", "schemas");
    const outFile  = resolve(appRoot, "prisma", "schema.prisma");

    const files = readdirSync(folder).filter(f => f.endsWith(".prisma")).sort();
    if (files.length === 0) {
      return NextResponse.json({ ok:false, error:`No .prisma files in ${folder}` }, { status:400 });
    }

    // Ensure prisma folder exists (in case)
    mkdirSync(resolve(appRoot, "prisma"), { recursive: true });

    // Read all parts
    const parts = files.map(f => {
      const p = resolve(folder, f);
      const txt = readFileSync(p, "utf8");
      return `// ───────── ${f} ─────────\n${txt.trim()}\n`;
    });

    // If your datasource/generator live in schemas too, keep them there.
    // Otherwise, prepend a minimal SQLite datasource & client generator:
    const prelude = `// corAe unified schema (built by Builder UI)
datasource db { provider = "sqlite" url = "file:./corae.db" }
generator client { provider = "prisma-client-js" }
`;

    writeFileSync(outFile, `${prelude}\n${parts.join("\n")}`, "utf8");
    return NextResponse.json({ ok:true, output: outFile });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message ?? String(e) }, { status:500 });
  }
}