import { NextResponse } from "next/server";
export async function POST() {
  // no-op placeholder; keep in-memory stores if you implement later
  return NextResponse.json({ ok:true, reset:true, at:new Date().toISOString() });
}
