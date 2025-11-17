import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/biz";

const prisma = new PrismaClient();

const statusMap: Record<string, "PLACED" | "CONFIRMED" | "RUNNING" | "CLOSING" | "INVOICED"> = {
  placed: "PLACED",
  confirmed: "CONFIRMED",
  running: "RUNNING",
  closing: "CLOSING",
  invoiced: "INVOICED",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const events = Array.isArray(body) ? body : [body];

    for (const e of events) {
      if (!e?.bdoId && !e?.id) {
        return NextResponse.json({ ok: false, error: "Missing bdoId (or id as alias)" }, { status: 400 });
      }
      if (!e.workflowId || !e.stage || !e.status) {
        return NextResponse.json({ ok: false, error: "workflowId, stage, status are required" }, { status: 400 });
      }
    }

  await prisma.$transaction(async (tx: any) => {
      for (const e of events) {
        const bdoId = e.bdoId ?? e.id;
        const at = e.at ? new Date(e.at) : new Date();

        await tx.bDO.upsert({
          where: { id: bdoId },
          create: {
            id: bdoId,
            name: e.bdoName ?? `${e.workflowId} · ${e.stage}`,
            tenantId: e.tenantId ?? "demo",
            lastKnownStatus: statusMap[String(e.status)] ?? null,
            estTotal: e.estTotal ?? null,
            estTax: e.estTax ?? null,
            supplierId: e.supplierId ?? null,
            locationId: e.locationId ?? null,
            reference: e.reference ?? null,
          },
          update: {},
        });

        await tx.event.create({
          data: {
            bdoId,
            type: "statusChange",
            payload: {
              workflowId: e.workflowId,
              stage: e.stage,
              status: e.status,
              qty: e.qty ?? null,
              vendor: e.vendor ?? null,
              sku: e.sku ?? null,
              note: e.note ?? null,
            },
            refType: e.refType ?? null,
            refId: e.refId ?? null,
            createdAt: at,
          },
        });

        const mapped = statusMap[String(e.status)];
        if (mapped) {
          await tx.bDO.update({
            where: { id: bdoId },
            data: { lastKnownStatus: mapped },
          });
        }
      }
    });

    return NextResponse.json({ ok: true, count: events.length });
  } catch (err: any) {
    console.error("BOMS events error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
