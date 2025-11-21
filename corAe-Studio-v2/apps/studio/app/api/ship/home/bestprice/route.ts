import { NextRequest } from "next/server";
import { json, CimsError } from "@/lib/cims/errors";
import { findPriceOptions } from "@/app/lib/commerce/affiliates/providers";
import { getCashbackFor } from "@/app/lib/commerce/cashback/engine";
import { z } from "zod";

const Body = z.object({ title: z.string().min(2), link: z.string().url().optional() });

export async function POST(req: NextRequest) {
  try {
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ ok: false, error: parsed.error.flatten() }, 400);
    const title = parsed.data.title.trim();
    const hintUrl = parsed.data.link;

    const options = await findPriceOptions({ title, hintUrl });
    const enriched = options.map((o) => ({ ...o, cashback: getCashbackFor(o.merchant) }));
    return json({ ok: true, options: enriched });
  } catch (e: any) {
    const err = e instanceof CimsError ? e : new CimsError("BESTPRICE_FAILED", 500, e?.message);
    return json({ ok: false, error: err.message }, err.status);
  }
}
