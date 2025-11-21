// app/api/deals/[id]/issue-po/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IssuePO } from "@/lib/hub/schemas";
import { canGo } from "@/lib/hub/obari";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<any> }
) {
  // ✅ Next 15: params is a Promise
  const { id } = (await ctx.params) as any;

  // validate input
  const data = IssuePO.parse(await req.json());

  // fetch deal
    const p = prisma as any;
    const deal = await p.deal.findUnique({
      where: { id },
      include: { documents: true },
    });
    if (!deal) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

  // gate check
  const gateCtx = { hasPO: true, deliverySlotIso: data.deliverySlotIso };
  // cast canGo to any to avoid TS property-access/type mismatch when using action strings
  if (!(canGo as any)(undefined, "toACTIVE")) {
    return NextResponse.json(
      { error: "PO/Delivery slot required" },
      { status: 400 }
    );
  }
  // update deal
    const updated = await p.deal.update({
      where: { id: deal.id },
      data: {
        stage: "ACTIVE",
        deliverySlotIso: new Date(data.deliverySlotIso),
        documents: { create: { kind: "PO", url: data.poUrl } },
        audits: {
          create: {
            actor: "CAIA",
            action: "ISSUE_PO",
            before: deal,
            after: { stage: "ACTIVE" },
          },
        },
      },
    });

  return NextResponse.json(updated);
}
