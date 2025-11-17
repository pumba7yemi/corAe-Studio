import { prepareBdoOrder, BdoOrderDraft, BdoPrepDeps } from './prepare';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Params = { [key: string]: string };

// Minimal POST handler that delegates to prepareBdoOrder. We await params as Promise form
export async function POST(req: NextRequest, ctx: { params: Promise<Params> }) {
  const p = await ctx.params;
  // body is expected to be a BdoOrderDraft
  const draft = (await req.json()) as BdoOrderDraft;

  // Provide simple dependencies for the prep run. These should be replaced by real adapters.
  const deps: BdoPrepDeps = {
    stockAdapter: async (i) => ({ sku: i.sku, ok: true }),
    mailerAdapter: async (_m) => ({ ok: true }),
    registryAdapter: async (_r) => {},
    contactResolver: async (_dir, _party) => ({ to: ["ops@example.com"] }),
  };

  const rec = await prepareBdoOrder(draft, deps);
  return NextResponse.json({ ok: true, rec, params: p });
}