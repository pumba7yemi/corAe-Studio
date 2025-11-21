import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ ok:true, msg:"CIMS debug suite operational", at:new Date().toISOString() });
}
