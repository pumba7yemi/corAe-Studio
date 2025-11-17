// apps/studio/app/api/oms/obari/thedeal/status/route.ts
import { NextResponse } from "next/server";

/**
 * Returns current status flags for a deal.
 * Prefers the dev in-memory store if available, otherwise falls back to a mock.
 * Replace both with Prisma lookups for production.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const dealId = url.searchParams.get("dealId");

  if (!dealId) {
    return NextResponse.json({ ok: false, error: "dealId required" }, { status: 400 });
  }

  // Try to use the dev proto store if it exists
  try {
    const mod = await import("../_store").catch(() => null);
    const getDeal = (mod && (mod as any).getDeal) as
      | ((id: string) => { id: string; pricelockConfirmed: boolean; slaBound: boolean })
      | undefined;

    if (typeof getDeal === "function") {
      const flags = getDeal(dealId);
      return NextResponse.json({ ok: true, status: flags });
    }
  } catch {
    // ignore and fall back to mock
  }

  // TODO (prod): replace with Prisma
  // const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  // if (!deal) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  // return NextResponse.json({ ok: true, status: { id: deal.id, pricelockConfirmed: deal.pricelockConfirmed, slaBound: deal.slaBound } });

  // Mock fallback so the page keeps working in dev without the store
  const mock = {
    id: dealId,
    pricelockConfirmed: false,
    slaBound: false,
  };
  return NextResponse.json({ ok: true, status: mock });
}