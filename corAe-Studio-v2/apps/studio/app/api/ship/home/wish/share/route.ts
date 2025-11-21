import { NextRequest } from "next/server";
import { json, CimsError } from "@/lib/cims/errors";
import * as store from "@/app/lib/home/iwant/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ids = (body?.itemIds ?? []) as string[];
    const title = typeof body?.title === "string" ? body.title : undefined;
    if (!Array.isArray(ids) || ids.length === 0) return json({ ok: false, error: "ITEM_IDS_REQUIRED" }, 400);

    const slug = (title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "wish") + "-" + Date.now().toString(36);
    const payload = await store.createShare(slug, ids, title);
    return json({ ok: true, slug, url: `/home/wish/${slug}`, share: payload });
  } catch (e: any) {
    const err = e instanceof CimsError ? e : new CimsError("SHARE_CREATE_FAILED", 500, e?.message);
    return json({ ok: false, error: err.message }, err.status);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "";
    if (!slug) return json({ ok: false, error: "SLUG_REQUIRED" }, 400);
    try {
      const doc = await store.readShare(slug);
      return json({ ok: true, share: { slug, title: doc.title, items: (doc.items || []).map((i:any) => ({ itemId: i.id })) } });
    } catch (e) {
      return json({ ok: false, error: "NOT_FOUND" }, 404);
    }
  } catch (e: any) {
    const err = e instanceof CimsError ? e : new CimsError("SHARE_RESOLVE_FAILED", 500, e?.message);
    return json({ ok: false, error: err.message }, err.status);
  }
}

