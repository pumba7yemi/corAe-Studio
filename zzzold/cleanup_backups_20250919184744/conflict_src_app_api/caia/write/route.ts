import { NextResponse } from "next/server";
import { appendMemory } from "../../../lib/caia";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = {
      id: new Date().toISOString()+"_"+Math.random().toString(36).slice(2,8),
      ts: new Date().toISOString(),
      who: body.who ?? "owner",
      type: body.type ?? "note",
      text: String(body.text ?? ""),
      tags: Array.isArray(body.tags) ? body.tags : undefined
    };
    await appendMemory(item);
    return NextResponse.json({ ok:true, saved:item });
  } catch(e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}
