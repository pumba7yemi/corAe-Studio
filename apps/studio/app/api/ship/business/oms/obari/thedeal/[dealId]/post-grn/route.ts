// app/api/deals/[id]/post-grn/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostGRN } from "@/lib/hub/schemas";
import { canGo } from "@/lib/hub/obari";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ dealId: string }> }
) {
  const { dealId } = await ctx.params;

  // validate payload
  const data = PostGRN.parse(await req.json());

  // fetch deal
  const deal = await (prisma as any).deal.findUnique({
    where: { id: dealId },
    include: { documents: true },
  });
  if (!deal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // gate check
  // canGo is a function (userId?: string, action?: string) => boolean
  // call it with undefined userId and the action name "toREPORTING"
  if (!canGo(undefined, "toREPORTING")) {
    return NextResponse.json(
      { error: "GRN/Report required" },
      { status: 400 }
    );
  }

  // update & audit
  const updated = await (prisma as any).deal.update({
    where: { id: deal.id },
    data: {
      stage: "REPORTING",
      documents: { create: { kind: "GRN", url: data.grnUrl } },
      audits: {
        create: {
          actor: "CAIA",
          action: "POST_GRN",
          before: deal,
          after: { stage: "REPORTING" },
        },
      },
    },
  });

  return NextResponse.json(updated);
}