// app/api/business/pos/checkout/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { observeInventory } from "../../../../ship/business/oms/finance/pos/observers/inventory.observer";

type CheckoutItem = {
  id?: string;
  code: string;        // Item.code
  name?: string;
  qty: number;
  price: number;
};

type CheckoutBody = {
  items: CheckoutItem[];
  total: number;
  paymentType?: "CASH" | "CARD" | "MIXED";
  terminalId?: string;
  loyaltyCode?: string; // optional voucher
  currency?: string;    // default AED
};

export async function POST(req: Request) {
  try {
    const body: CheckoutBody = await req.json();
    const { items, total, paymentType, terminalId, loyaltyCode, currency } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: "Cart is empty" }, { status: 400 });
    }

    // Ensure all referenced items exist
    const codes = items.map((i) => i.code);
    type DBItem = { id: string; code: string; name?: string | null; price: number; taxRate?: number | null };
    const dbItems: DBItem[] = await (prisma as any).item.findMany({
      where: { code: { in: codes } },
      select: { id: true, code: true, name: true, price: true, taxRate: true },
    });
    const map = new Map(dbItems.map((x: DBItem) => [x.code, x]));
    const missing = codes.filter((c) => !map.has(c));
    if (missing.length) {
      return NextResponse.json(
        { ok: false, error: `Unknown product codes: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // Optional: verify voucher
    let voucherToRedeem: { id: string } | null = null;
    if (loyaltyCode) {
      const v = await (prisma as any).loyaltyVoucher.findUnique({
        where: { code: loyaltyCode },
        select: { id: true, redeemed: true, expiresAt: true, minSpend: true, value: true },
      });
      if (!v) {
        return NextResponse.json({ ok: false, error: "Voucher not found" }, { status: 400 });
      }
      if (v.redeemed) {
        return NextResponse.json({ ok: false, error: "Voucher already redeemed" }, { status: 400 });
      }
      if (v.expiresAt && v.expiresAt < new Date()) {
        return NextResponse.json({ ok: false, error: "Voucher expired" }, { status: 400 });
      }
      if (v.minSpend && new Decimal(total).lessThan(v.minSpend)) {
        return NextResponse.json({ ok: false, error: "Voucher min spend not met" }, { status: 400 });
      }
      voucherToRedeem = { id: v.id };
    }
    // Transaction: create Sale, SaleLines, update StockState, create FlowEvents(OUT)
    const result: { saleId: string; flowIds: string[] } = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const sale = await (tx as any).sale.create({
        data: {
          status: "COMPLETED",
          total: new Decimal(total),
          currency: currency || "AED",
          paymentType,
          terminalId,
        },
      });

      // Create sale lines and update stock/flows
      const createdLines = [];
      const createdFlowIds: string[] = [];

      for (const i of items) {
        const base = map.get(i.code)!;

        const line = await (tx as any).saleLine.create({
          data: {
            saleId: sale.id,
            itemId: base.id,
            qty: new Decimal(i.qty),
            unitPrice: new Decimal(i.price),
            lineTotal: new Decimal((i.price || 0) * (i.qty || 1)),
          },
        });
        createdLines.push(line);

        // Upsert stock state
        const stock = await (tx as any).stockState.upsert({
          where: { itemId: base.id },
          update: { onHand: { decrement: i.qty }, lastSync: new Date() },
          create: { itemId: base.id, onHand: new Decimal(0).minus(i.qty) },
        });

        // Log flow event (OUT)
        const flow = await (tx as any).flowEvent.create({
          data: {
            itemId: base.id,
            stage: "SALE",
            direction: "OUT",
            qty: new Decimal(i.qty),
            sourceRef: sale.id,
          },
          select: { id: true },
        });
        createdFlowIds.push(flow.id);
      }

      // Redeem voucher if provided
      if (voucherToRedeem) {
        await (tx as any).loyaltyVoucher.update({
          where: { id: voucherToRedeem.id },
          data: { redeemed: true, redeemedAt: new Date(), saleId: sale.id },
        });
      }

      return { saleId: sale.id, flowIds: createdFlowIds };
    });

    // Trigger inventory observer for each OUT flow (await in parallel)
    await Promise.all(result.flowIds.map((flowId: string) => observeInventory(flowId)));

    return NextResponse.json({
      ok: true,
      saleId: result.saleId,
      flowsObserved: result.flowIds.length,
      message: "Sale recorded, stock updated, observers run.",
    });
  } catch (err) {
    console.error("[POS Checkout Error]", err);
    let message: string;
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    } else {
      try {
        message = JSON.stringify(err);
      } catch {
        message = String(err);
      }
      if (!message) message = "Unknown error";
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
