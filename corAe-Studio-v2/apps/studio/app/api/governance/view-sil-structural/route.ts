import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const script = path.join(process.cwd(), "corAe-Studio-v2", "tools", "sil-scan.mjs");
    if (fs.existsSync(script)) {
      // prefer executing the tool if present
      const { exec } = await import("child_process");
      const p = new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        exec(`node "${script}"`, { cwd: path.dirname(script) }, (err: any, stdout: string, stderr: string) => {
          if (err) return reject(err);
          resolve({ stdout, stderr });
        });
      });
      const out = await p;
      return NextResponse.json({ ok: true, output: out.stdout + out.stderr });
    }
    return NextResponse.json({ ok: false, output: "sil-scan tool not found in tools/" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, output: String(err.message || err) });
  }
}
