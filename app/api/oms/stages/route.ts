// apps/studio/app/api/oms/stages/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const P = (...a: string[]) => path.join(process.cwd(), ...a);

function countDir(...rel: string[]) {
  try {
    const dir = P(...rel);
    if (!fs.existsSync(dir)) return 0;
    return fs.readdirSync(dir).filter(f => f.endsWith(".json")).length;
  } catch {
    return 0;
  }
}

export async function GET() {
  const data = {
    orders:     countDir("data","oms","obari","orders"),
    booking:    countDir("data","oms","obari","booking"),
    active:     countDir("data","oms","obari","active"),
    reporting:  countDir("data","oms","obari","reporting"),
    invoicing:  countDir("data","oms","obari","invoicing"),
    // Optional rollups (useful later)
    operations: countDir("data","oms","operations"),
    finance:    countDir("data","oms","finance"),
    ts: Date.now()
  };
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}