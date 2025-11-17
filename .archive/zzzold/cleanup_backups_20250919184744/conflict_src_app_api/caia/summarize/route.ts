import { NextResponse } from "next/server";
import { dailySummarize } from "../../../lib/caia";
export async function POST() {
  const r = await dailySummarize();
  return NextResponse.json({ ok:true, ...r });
}
