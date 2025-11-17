import { NextResponse } from "next/server";
import { heartbeat } from "../../../lib/caia";
export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  const status = body.status === "busy" ? "busy" : body.status === "offline" ? "offline" : "online";
  const beat = await heartbeat(status);
  return NextResponse.json({ ok:true, beat });
}
