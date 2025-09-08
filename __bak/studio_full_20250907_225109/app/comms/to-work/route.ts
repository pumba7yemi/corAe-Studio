// apps/studio/app/api/comms/to-work/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const P = (...a:string[]) => path.join(process.cwd(), ...a);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = String(body?.title || "").slice(0, 200);
    const source = String(body?.source || "unknown");
    const evidence_path = String(body?.evidence_path || "");

    if (!title) return NextResponse.json({ ok:false, error:"Missing title" }, { status:400 });

    const id = "w_" + Math.random().toString(36).slice(2, 9);
    const work = {
      id,
      source,
      kind: "from_feed",
      priority: 0.5,
      evidence: { title, evidence_path },
      action: "create_comm_draft"
    };

    const dir = P("data","workbrain","queue");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, id + ".json"), JSON.stringify(work, null, 2));

    return NextResponse.json({ ok:true, id });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || "unknown" }, { status:500 });
  }
}