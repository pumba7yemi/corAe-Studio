import { NextResponse } from "next/server";
import { spawn } from "child_process";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { task } = await req.json();
  if (!task) return NextResponse.json({ error: "Missing task" }, { status: 400 });

  const proc = spawn("node", ["scripts/agent/worker.js", "run", task], {
    cwd: process.cwd() + "/apps/studio",
    shell: false,
    env: process.env,
  });

  let output = "";
  proc.stdout.on("data", (d) => (output += d.toString()));
  proc.stderr.on("data", (d) => (output += d.toString()));

  await new Promise((res) => proc.on("close", res));
  return NextResponse.json({ ok: true, output });
}
