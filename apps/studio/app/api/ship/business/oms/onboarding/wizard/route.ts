// apps/studio/app/api/ship/business/oms/onboarding/wizard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type StepName =
  | "lead"
  | "btdo.intake"
  | "btdo.accept"
  | "bdo.pricelock"
  | "bdo.booking-sheet"
  | "bdo.documentation"
  | "bdo.activate";

type PostBody = { step: StepName; payload: any };

export async function POST(req: NextRequest) {
  try {
    const { step, payload } = (await req.json()) as PostBody;
    switch (step) {
      case "btdo.intake":         return await handleIntake(payload);
      case "btdo.accept":         return await handleAccept(payload);
      case "bdo.booking-sheet":   return await handleBookingSheet(payload);
      case "bdo.activate":        return await handleActivate(payload);
      default:
        return NextResponse.json({ error: `Unsupported step: ${step}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}

/* ── Steps ───────────────────────────────────────────── */

async function handleIntake(p: {
  sector?: string | null; service?: string | null; workKind?: string | null;
  geography?: string | null; siteAddress?: string | null;
  meta?: Record<string, any>;
  contacts?: Array<{ fullName: string; email?: string | null; phone?: string | null; role?: string | null; primary?: boolean; linkRole?: string | null; }>;
}) {
  const number = await nextDealNumber();
  const deal = await prisma.deal.create({
    data: {
      number, stage: "BTDO" as any, status: "proposed" as any,
      currency: "AED", subtotal: 0 as any, taxTotal: 0 as any, total: 0 as any,
    } as any,
  });

  await prisma.deal.update({
    where: { id: deal.id },
    data: { meta: { intake: { ...p, at: new Date().toISOString() } } as any },
  }).catch(()=>{});

  await safeChrono({ scope:"SALES", message:`BTDO Intake for ${deal.number}`, refType:"Deal", refId:deal.id, dealId:deal.id });

  return NextResponse.json({ ok: true, dealId: deal.id, nextStep: "btdo.accept" });
}

async function handleAccept(p: {
  dealId: string; quoteId?: string; priceLocked?: boolean; corAeConfirmed?: boolean;
  acceptedBy?: { email?: string | null }; note?: string | null;
}) {
  const deal = await mustFindDeal(p.dealId);

  await prisma.deal.update({
    where: { id: deal.id },
    data: {
      status: "approved" as any,
      meta: { accept: { ...p, at: new Date().toISOString() } } as any,
    },
  }).catch(()=>{});

  await safeChrono({ scope:"SALES", message:`Acceptance saved (quote ${p.quoteId || "n/a"})`, refType:"Deal", refId:deal.id, dealId:deal.id });

  return NextResponse.json({ ok: true, dealId: deal.id, nextStep: "bdo.pricelock" });
}

async function handleBookingSheet(p: {
  dealId: string; poNumber?: string; soNumber?: string; bookingSheetUrl?: string;
  confirmedBy?: { email?: string | null };
}) {
  const deal = await mustFindDeal(p.dealId);

  const notes = { poNumber:p.poNumber||null, soNumber:p.soNumber||null, bookingSheetUrl:p.bookingSheetUrl||null, confirmedByEmail:p.confirmedBy?.email||null };
  const startAt = new Date(); const endAt = new Date(startAt.getTime()+60*60*1000);

  const booking = await prisma.booking.create({
    data: { number: await nextBookingNumber(), status: "tentative" as any, dealId: deal.id, startAt, endAt, notes: JSON.stringify(notes) } as any,
  });

  await prisma.deal.update({
    where: { id: deal.id },
    data: { meta: { bookingSheet: { id: booking.id, number: booking.number, notes } } as any },
  }).catch(()=>{});

  await safeChrono({ scope:"OPERATIONS", message:`Booking sheet captured (PO=${p.poNumber||"n/a"})`, refType:"Deal", refId:deal.id, dealId:deal.id });

  return NextResponse.json({ ok: true, dealId: deal.id, nextStep: "bdo.documentation" });
}

async function handleActivate(p: { dealId: string }) {
  const deal = await mustFindDeal(p.dealId);
  const updated = await prisma.deal.update({
    where: { id: deal.id },
    data: { stage: "BDO" as any, status: "confirmed" as any, updatedAt: new Date() },
  });

  await safeChrono({ scope:"OPERATIONS", message:`Deal ${updated.number} ACTIVATED`, refType:"Deal", refId:updated.id, dealId:updated.id });

  return NextResponse.json({ ok: true, dealId: updated.id, nextStep: null });
}

/* ── Utils ───────────────────────────────────────────── */

async function mustFindDeal(dealId: string) {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) throw new Error("Deal not found");
  return deal;
}
async function nextDealNumber(){ const d=new Date().toISOString().slice(0,10).replace(/-/g,""); const t=Math.random().toString(36).slice(2,6).toUpperCase(); return `BDO-${d}-${t}`; }
async function nextBookingNumber(){ const d=new Date().toISOString().slice(0,10).replace(/-/g,""); const t=Math.random().toString(36).slice(2,6).toUpperCase(); return `BKG-${d}-${t}`; }

async function safeChrono(data:{scope:"GENERAL"|"WORKFLOWS"|"OPERATIONS"|"HR"|"FINANCE"|"MARKETING"|"SALES";message:string;refType?:string;refId?:string;dealId?:string;contactId?:string;}) {
  try { await (prisma as any).chrono.create({ data }); } catch {}
}