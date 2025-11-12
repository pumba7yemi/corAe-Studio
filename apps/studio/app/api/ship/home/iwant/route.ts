import { NextRequest } from "next/server";
import { WantCreate, WantItem, WantList } from "@/app/lib/home/iwant/schemas";
import { CimsError, json } from "@/lib/cims/errors";
import * as store from "@/app/lib/home/iwant/store";

export async function GET() {
  try {
    const all = await store.readAll();
    return json(WantList.parse(all));
  } catch (e: any) {
    const err = e instanceof CimsError ? e : new CimsError("IWANT_GET_FAILED", 500, e?.message);
    return json({ ok: false, error: err.message }, err.status);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = WantCreate.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: parsed.error.flatten() }, 400);

    const itemIn = {
      title: parsed.data.title ?? "",
      category: parsed.data.category ?? "General",
      estimate: typeof parsed.data.estimate === "number" ? parsed.data.estimate : 0,
      priority: (parsed.data.priority ?? "MEDIUM") as any,
      targetDate: parsed.data.targetDate,
      link: parsed.data.link,
      notes: parsed.data.notes,
      tags: parsed.data.tags ?? [],
    } as Partial<WantItem> & { title: string };

    const saved = await store.upsert(itemIn as any);
    return json({ ok: true, item: saved });
  } catch (e: any) {
    const err = e instanceof CimsError ? e : new CimsError("IWANT_POST_FAILED", 500, e?.message);
    return json({ ok: false, error: err.message }, err.status);
  }
}
