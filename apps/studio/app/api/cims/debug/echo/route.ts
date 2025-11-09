import { NextResponse, NextRequest } from "next/server";
export async function GET(req: NextRequest) {
  const q: Record<string,string> = {};
  req.nextUrl.searchParams.forEach((v,k)=>q[k]=v);
  return NextResponse.json({ ok:true, method:"GET", query:q, at:new Date().toISOString() });
}
export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>({}));
  return NextResponse.json({ ok:true, method:"POST", body, at:new Date().toISOString() });
}
