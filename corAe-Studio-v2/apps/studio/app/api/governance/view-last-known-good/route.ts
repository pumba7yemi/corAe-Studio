import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const backupsDir = path.join(process.cwd(), "corAe-Studio-v2", ".corae", "backups");
    if (!fs.existsSync(backupsDir)) return NextResponse.json({ ok: false, output: "backups folder not found" });
    const files = fs.readdirSync(backupsDir).filter((f) => f.endsWith(".zip"));
    if (files.length === 0) return NextResponse.json({ ok: false, output: "no backup zips found" });
    // pick latest by name which embeds timestamp
    files.sort();
    const latest = files[files.length - 1];
    return NextResponse.json({ ok: true, output: latest });
  } catch (err: any) {
    return NextResponse.json({ ok: false, output: String(err.message || err) });
  }
}
