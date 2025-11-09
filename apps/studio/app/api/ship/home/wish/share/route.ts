import { NextRequest } from "next/server";
import { json, CimsError } from "@/lib/cims/errors";
import { WantList } from "@/app/lib/home/iwant/schemas";

type ShareDoc = { slug: string; title?: string; itemIds: string[]; createdAt: number };
const SHARES = new Map<string, ShareDoc>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ids = (body?.itemIds ?? []) as string[];
    const title = typeof body?.title === "string" ? body.title : undefined;
    if (!Array.isArray(ids) || ids.length === 0) return json({ ok: false, error: "ITEM_IDS_REQUIRED" }, 400);

    const slug = (title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "wish") + "-" + Date.now().toString(36);
    SHARES.set(slug, { slug, title, itemIds: ids, createdAt: Date.now() });
    return json({ ok: true, slug, url: `/ship/home/wish/${slug}` });
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
    const doc = SHARES.get(slug);
    if (!doc) return json({ ok: false, error: "NOT_FOUND" }, 404);
    return json({ ok: true, share: doc });
  } catch (e: any) {
    const err = e instanceof CimsError ? e : new CimsError("SHARE_RESOLVE_FAILED", 500, e?.message);
    return json({ ok: false, error: err.message }, err.status);
  }
}
