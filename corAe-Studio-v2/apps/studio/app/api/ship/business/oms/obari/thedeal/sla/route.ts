import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { dealId, sla } = await req.json();
    if (!dealId) return NextResponse.json({ ok: false, error: "dealId required" }, { status: 400 });

    // TODO: replace with Prisma integration:
    // await prisma.dealDocument.create({ data: { dealId, type: "SLA", contentJson: sla }});
    // await prisma.deal.update({ where: { id: dealId }, data: { slaBound: true }});

    return NextResponse.json({ ok: true, dealId, version: sla.version ?? 1 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}