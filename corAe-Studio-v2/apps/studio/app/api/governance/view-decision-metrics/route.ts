import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const metricsPath = path.join(process.cwd(), "corAe-Studio-v2", ".corae", "metrics.json");
    if (fs.existsSync(metricsPath)) {
      const raw = fs.readFileSync(metricsPath, "utf-8");
      return NextResponse.json({ ok: true, output: raw });
    }
    return NextResponse.json({ ok: false, output: "metrics.json not found in .corae" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, output: String(err.message || err) });
  }
}
