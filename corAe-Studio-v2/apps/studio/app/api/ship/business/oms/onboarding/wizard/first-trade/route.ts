import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Params = { [key: string]: string };

// Minimal handler to satisfy Next typegen. Real implementation lives elsewhere.
export async function POST(_req: NextRequest, ctx: { params: Promise<Params> }) {
	const params = await ctx.params;
	return NextResponse.json({ ok: true, params });
}
