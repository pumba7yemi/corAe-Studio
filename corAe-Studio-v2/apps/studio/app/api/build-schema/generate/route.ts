import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function runPrisma(cmdArgs: string[]) {
  return new Promise<string>((ok, bad) => {
    const isWin = process.platform === "win32";
    const bin = isWin ? "npx.cmd" : "npx";
    const child = spawn(bin, ["prisma", ...cmdArgs], {
      cwd: process.cwd(), // apps/studio
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    const out: Buffer[] = [];
    const err: Buffer[] = [];
    child.stdout.on("data", d => out.push(d));
    child.stderr.on("data", d => err.push(d));
    child.on("error", bad);
    child.on("close", c => {
      const txt = [Buffer.concat(out).toString(), Buffer.concat(err).toString()].join("\n").trim();
      if (c === 0) ok(txt || "ok");
      else bad(new Error(txt || `exit ${c}`));
    });
  });
}

export async function POST() {
  const schemaPath = resolve(process.cwd(), "prisma", "schema.prisma");
  try {
    const output = await runPrisma(["generate", "--schema", schemaPath]);
    return NextResponse.json({ ok:true, output });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message ?? String(e) }, { status:500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok:true, info:"POST to run `prisma generate`" });
}