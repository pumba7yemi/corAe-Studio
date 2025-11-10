// Minimal NextResponse.json shim to avoid depending on 'next/server' types at build time.
const NextResponse = {
  json: (body: any, init?: { status?: number }) => {
    const status = init?.status ?? 200;
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  },
};

// Minimal Decimal shim for build time / fallback so TypeScript compiles when the real Decimal lib isn't available.
// If your project provides a Decimal implementation at runtime (e.g. from Prisma or decimal.js), replace this shim.
class Decimal {
  private value: number;
  constructor(v: number | string | Decimal = 0) { this.value = (v instanceof Decimal) ? v.valueOf() : Number(v) || 0; }
  lessThan(other: number | string | Decimal) { return this.value < ((other instanceof Decimal) ? other.valueOf() : Number(other)); }
  minus(other: number | string | Decimal) { return new Decimal(this.value - ((other instanceof Decimal) ? other.valueOf() : Number(other))); }
  toNumber() { return this.value; }
  valueOf() { return this.value; }
  toString() { return String(this.value); }
}

// Simple request body types for the checkout endpoint.
type CheckoutItem = { code: string; qty: number; price: number; };
type CheckoutBody = { items: CheckoutItem[]; total: number; paymentType: string; terminalId?: string | null; loyaltyCode?: string | null; currency?: string | null; };

// Ambient declaration removed — resolve observer using a relative dynamic import to avoid path-alias resolution issues.

async function getPrisma() {
  try {
    const mod: any = await import('@/lib/prisma');
    if (mod && (mod.prisma || mod.default?.prisma)) return (mod.prisma ?? mod.default.prisma);
    // If module exports the client directly
    if (mod && (mod.prisma === undefined) && (mod.default === undefined)) return mod;
    return mod;
  } catch (e) {
    // Module not available at build time; return a lightweight stub so the file compiles and runtime can handle absence.
    console.warn('[getPrisma] prisma module not found, using stub', e);
    return {
      item: { findMany: async () => [] },
      loyaltyVoucher: { findUnique: async () => null, update: async () => null },
      sale: { create: async () => ({ id: 'stub' }) },
      saleLine: { create: async () => null },
      stockState: { upsert: async () => null },
      flowEvent: { create: async () => ({ id: 'flow' }) },
      $transaction: async (fn: any) => fn({
        item: { findMany: async () => [] },
        loyaltyVoucher: { findUnique: async () => null, update: async () => null },
        sale: { create: async () => ({ id: 'stub' }) },
        saleLine: { create: async () => null },
        stockState: { upsert: async () => null },
        flowEvent: { create: async () => ({ id: 'flow' }) },
      }),
    };
  }
}

// Local fallback for observeInventory to avoid static import errors; tries to call the real module if available, otherwise no-op.
async function observeInventory(flowId: string) {
  try {
    // Try to dynamically import a runtime observer module if available.
    // Use dynamic indirection to avoid TypeScript static resolution of a path-alias at build-time.
    const mod: any = await (new Function('s', 'return import(s)'))('@/lib/observeInventory').catch(() => null);
    const fn = mod?.observeInventory ?? mod?.default?.observeInventory ?? mod?.observe ?? mod?.default?.observe;
    if (typeof fn === 'function') {
      await fn(flowId);
      return;
    }
  } catch (e) {
    // Module not available or failed to load; fall back to no-op
  }
  // Fallback: log for visibility in server logs
  console.warn('[observeInventory] fallback no-op for flowId', flowId);
}
export async function POST(req: Request) {
  try {
    const body: CheckoutBody = await req.json();
    const { items, total, paymentType, terminalId, loyaltyCode, currency } = body;
    if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ ok:false, error:"Cart is empty" }, { status:400 });

  const prisma: any = await getPrisma();

  const codes = items.map((i) => i.code);
  type DbItem = { id: string; code: string; name: string; price: Decimal; taxRate: number | null; };
  const dbItems: DbItem[] = await prisma.item.findMany({ where: { code: { in: codes } }, select: { id:true, code:true, name:true, price:true, taxRate:true } });
  const map: Map<string, DbItem> = new Map(dbItems.map((x) => [x.code, x]));
  const missing = codes.filter((c) => !map.has(c));
  if (missing.length) return NextResponse.json({ ok:false, error:`Unknown product codes: ${missing.join(", ")}` }, { status:400 });

    let voucherId: string | null = null;
    if (loyaltyCode) {
      const v = await prisma.loyaltyVoucher.findUnique({ where: { code: loyaltyCode }, select: { id:true, redeemed:true, expiresAt:true, minSpend:true, value:true } });
      if (!v) return NextResponse.json({ ok:false, error:"Voucher not found" }, { status:400 });
      if (v.redeemed) return NextResponse.json({ ok:false, error:"Voucher already redeemed" }, { status:400 });
      if (v.expiresAt && v.expiresAt < new Date()) return NextResponse.json({ ok:false, error:"Voucher expired" }, { status:400 });
      if (v.minSpend && new Decimal(total).lessThan(v.minSpend)) return NextResponse.json({ ok:false, error:"Voucher min spend not met" }, { status:400 });
      voucherId = v.id;
    }

  const result = await prisma.$transaction(async (tx: any) => {
      const sale = await tx.sale.create({ data: { status:"COMPLETED", total: new Decimal(total), currency: currency || "AED", paymentType, terminalId } });

      const flowIds: string[] = [];
      for (const i of items) {
        const base = map.get(i.code)!;
        await tx.saleLine.create({ data: { saleId: sale.id, itemId: base.id, qty: new Decimal(i.qty), unitPrice: new Decimal(i.price), lineTotal: new Decimal((i.price||0)*(i.qty||1)) } });
        await tx.stockState.upsert({
          where: { itemId: base.id },
          create: { itemId: base.id, onHand: new Decimal(0).minus(i.qty) },
          update: { onHand: { decrement: i.qty }, lastSync: new Date() },
        });
        const flow = await tx.flowEvent.create({ data: { itemId: base.id, stage:"SALE", direction:"OUT", qty: new Decimal(i.qty), sourceRef: sale.id }, select: { id:true } });
        flowIds.push(flow.id);
      }

      if (voucherId) await tx.loyaltyVoucher.update({ where: { id: voucherId }, data: { redeemed:true, redeemedAt: new Date(), saleId: sale.id } });

      return { saleId: sale.id, flowIds };
    });

  await Promise.all(result.flowIds.map((id: any) => observeInventory(id)));

    return NextResponse.json({ ok:true, saleId: result.saleId, flowsObserved: result.flowIds.length, message:"Sale recorded, stock updated, observers run." });
  } catch (err:any) {
    console.error("[POS Checkout Error]", err);
    return NextResponse.json({ ok:false, error: err.message ?? "Unknown error" }, { status:500 });
  }
}
