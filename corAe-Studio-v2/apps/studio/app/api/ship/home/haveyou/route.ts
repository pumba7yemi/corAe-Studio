// apps/studio/app/api/home/haveyou/route.ts
import { NextRequest, NextResponse } from "next/server";

interface HaveYou { id?:string; text:string; schedule:string; scope?: "HOME"|"WORK"|"BUSINESS"; enabled?:boolean }

const mem = { items: [] as HaveYou[] };
const newid = () => "hv_" + Math.random().toString(36).slice(2,10);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") ?? undefined;
  const list = scope ? mem.items.filter(i => i.scope === scope) : mem.items;
  return NextResponse.json({ ok:true, items: list });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  if (body.action === "bulkUpsert") {
    const items = Array.isArray(body.items) ? body.items as HaveYou[] : [];
    for (const it of items) {
      if (it.id) {
        const idx = mem.items.findIndex(x => x.id === it.id);
        if (idx >= 0) { mem.items[idx] = { ...mem.items[idx], ...it }; continue; }
      }
      mem.items.unshift({ ...it, id: newid(), scope: it.scope ?? "HOME", enabled: it.enabled ?? true });
    }
    mem.items = mem.items.slice(0, 1000);
    return NextResponse.json({ ok:true, count: items.length });
  }
  if (body.action === "create") {
    const rec = { ...body.item, id: newid(), scope: body.item?.scope ?? "HOME", enabled: true } as HaveYou;
    mem.items.unshift(rec);
    return NextResponse.json({ ok:true, item: rec });
  }
  return NextResponse.json({ ok:false, error:"Unknown action" }, { status:400 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok:false, error:"id required" }, { status:400 });
  mem.items = mem.items.filter(i => i.id !== id);
  return NextResponse.json({ ok:true });
}
