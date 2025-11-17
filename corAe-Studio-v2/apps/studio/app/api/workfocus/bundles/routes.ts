import { NextResponse } from "next/server";
import { saveBundle, listBundles } from "@/lib/workfocus/io";
import type { WorkFocusBundle } from "@/lib/workfocus/types";

export async function GET() {
  const ids = await listBundles();
  return NextResponse.json({ ok: true, ids });
}

export async function POST(req: Request) {
  try {
    const bundle = (await req.json()) as WorkFocusBundle;
    if (!bundle?.id || !bundle?.nodes?.length) throw new Error("Bundle requires id and nodes[]");
    await saveBundle(bundle);
    return NextResponse.json({ ok: true, id: bundle.id, count: bundle.nodes.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
