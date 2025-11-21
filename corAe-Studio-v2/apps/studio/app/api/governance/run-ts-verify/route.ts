import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execP = promisify(exec);

export async function POST() {
  const cwd = path.join(process.cwd());
  try {
    const cmd = `pnpm -w -r exec tsc -b --noEmit`;
    const env = { ...process.env, CAIA_150_STRICT: "true", CAIA_GATE_MIN: "140" } as any;
    const { stdout, stderr } = await execP(cmd, { cwd, env, maxBuffer: 20 * 1024 * 1024 });
    return NextResponse.json({ ok: true, output: (stdout || "") + (stderr || "") });
  } catch (err: any) {
    return NextResponse.json({ ok: false, output: String(err.message || err) });
  }
}
