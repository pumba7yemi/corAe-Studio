import { NextRequest } from "next/server";
import { WantCreate, WantItem, WantList } from "@/app/lib/home/iwant/schemas";
import { CimsError, json } from "@/lib/cims/errors";

let CACHE: ReturnType<typeof WantList.parse> = [];

export async function GET() {
  try {
    return json(WantList.parse(CACHE));
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

    const now = new Date().toISOString();
    const item: WantItem = {
      id: `want_${Date.now().toString(36)}`,
      title: parsed.data.title ?? "",
      category: parsed.data.category ?? "General",
      estimate: typeof parsed.data.estimate === "number" ? parsed.data.estimate : 0,
      priority: (parsed.data.priority ?? "MEDIUM") as any,
      targetDate: parsed.data.targetDate,
      link: parsed.data.link,
      notes: parsed.data.notes,
      status: "WISHLIST",
      tags: parsed.data.tags ?? [],
      createdAt: now,
      updatedAt: now,
    } as WantItem;
    CACHE.unshift(item);
    return json({ ok: true, item });
  } catch (e: any) {
    const err = e instanceof CimsError ? e : new CimsError("IWANT_POST_FAILED", 500, e?.message);
    return json({ ok: false, error: err.message }, err.status);
  }
}
