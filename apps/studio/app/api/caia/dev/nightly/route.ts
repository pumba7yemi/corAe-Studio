import { NextResponse } from "next/server";
import path from "path";
import child_process from "child_process";

export async function POST() {
  try {
    const repoRoot = path.join(process.cwd(), "..", "..");
    const command = "node";
    const args = ["tools/nightly-green-sweep.mjs"];

    const result = child_process.spawnSync(command, args, { cwd: repoRoot, encoding: "utf8" });

    const exitCode = typeof result.status === "number" ? result.status : 1;
    const stdout = result.stdout || "";
    const stderr = result.stderr || "";

    return NextResponse.json({ ok: exitCode === 0, exitCode, command: `${command} ${args.join(" ")}`, stdout, stderr });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
