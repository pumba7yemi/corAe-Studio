import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execP = promisify(exec);

export async function POST() {
  const cwd = path.join(process.cwd(), "corAe-Studio-v2");
  const script = path.join(cwd, "tools", "backup-core.mjs");
  try {
    // If the script exists, run with node; else return helpful message
    const cmd = `node "${script}"`;
    const { stdout, stderr } = await execP(cmd, { cwd, maxBuffer: 10 * 1024 * 1024 });
    return NextResponse.json({ ok: true, output: (stdout || "") + (stderr || "") });
  } catch (err: any) {
    return NextResponse.json({ ok: false, output: String(err.message || err) });
  }
}
