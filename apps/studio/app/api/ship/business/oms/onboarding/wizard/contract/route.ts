import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/ship/business/oms/onboarding/wizard/contract
 *
 * Handles Contract / Booking phase.
 *
 * Body:
 * {
 *   dealId: string;
 *   contract?: {
 *     contractUrlOrEmailRef: string;
 *     agreementWindow?: string;
 *     agreementScope?: string;
 *     agreementTotal?: number;
 *     contractedByEmail?: string;
 *     note?: string;
 *   };
 *   booking?: {
 *     poNumber?: string;
 *     soNumber?: string;
 *     bookingSheetUrl?: string;
 *     confirmedByEmail?: string;
 *   };
 * }
 *
 * Response:
 *   { ok: true, dealId, nextStep: "bdo.booking-sheet" | "bdo.documentation" | "bdo.activate" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dealId = String(body.dealId || "").trim();
    if (!dealId) return NextResponse.json({ error: "dealId required" }, { status: 400 });

    const deal = await (prisma as any).deal.findUnique({ where: { id: dealId }, select: { id: true, status: true } });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    const updates: any = {};
    const now = new Date();

    await prisma.$transaction(async (tx: any) => {
      // CONTRACT
      if (body.contract) {
        const c = body.contract;
        const contract = await tx.contract.upsert({
          where: { dealId },
          update: {
            contractUrlOrEmailRef: c.contractUrlOrEmailRef,
            agreementWindow: c.agreementWindow ?? undefined,
            agreementScope: c.agreementScope ?? undefined,
            agreementTotal: c.agreementTotal ?? undefined,
            contractedByEmail: c.contractedByEmail ?? undefined,
            note: c.note ?? undefined,
            updatedAt: now,
          },
          create: {
            dealId,
            contractUrlOrEmailRef: c.contractUrlOrEmailRef,
            agreementWindow: c.agreementWindow ?? null,
            agreementScope: c.agreementScope ?? null,
            agreementTotal: c.agreementTotal ?? null,
            contractedByEmail: c.contractedByEmail ?? null,
            note: c.note ?? null,
            createdAt: now,
          },
        });

        await safeChrono(tx, {
          scope: "OPERATIONS",
          message: `Contract / Agreement recorded for deal ${dealId} (${c.contractUrlOrEmailRef || "no ref"}).`,
          refType: "Contract",
          refId: contract.id,
          dealId,
        });

        updates.contractId = contract.id;
      }

      // BOOKING
      if (body.booking) {
        const b = body.booking;
        const booking = await tx.bookingSheet.upsert({
          where: { dealId },
          update: {
            poNumber: b.poNumber ?? undefined,
            soNumber: b.soNumber ?? undefined,
            bookingSheetUrl: b.bookingSheetUrl ?? undefined,
            confirmedByEmail: b.confirmedByEmail ?? undefined,
            confirmedAt: b.confirmedByEmail ? now : undefined,
            updatedAt: now,
          },
          create: {
            dealId,
            poNumber: b.poNumber ?? null,
            soNumber: b.soNumber ?? null,
            bookingSheetUrl: b.bookingSheetUrl ?? null,
            confirmedByEmail: b.confirmedByEmail ?? null,
            confirmedAt: b.confirmedByEmail ? now : null,
            createdAt: now,
          },
        });

        await safeChrono(tx, {
          scope: "OPERATIONS",
          message: `Booking sheet recorded for deal ${dealId} (PO: ${b.poNumber || "—"} | SO: ${b.soNumber || "—"}).`,
          refType: "Booking",
          refId: booking.id,
          dealId,
        });

        updates.bookingId = booking.id;

        // Update deal status to BDO_READY if contract + booking done
        await tx.deal.update({
          where: { id: dealId },
          data: {
            status: "BDO_READY",
            bdoReadyAt: now,
          },
        });

        await safeChrono(tx, {
          scope: "WORKFLOWS",
          message: `Deal ${dealId} transitioned to BDO_READY.`,
          refType: "Deal",
          refId: dealId,
          dealId,
        });
      }
    });

    const nextStep = body.booking ? "bdo.documentation" : "bdo.booking-sheet";
    return NextResponse.json({ ok: true, dealId, nextStep });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}

/* ───────────────────────────── Helpers ───────────────────────────── */
async function safeChrono(
  tx: Prisma.TransactionClient,
  data: {
    scope: "GENERAL" | "WORKFLOWS" | "OPERATIONS" | "HR" | "FINANCE" | "MARKETING" | "SALES";
    message: string;
    refType?: string;
    refId?: string;
    dealId?: string;
    contactId?: string;
  }
) {
  try {
    await (tx as any).chrono.create({ data });
  } catch {
    // swallow if not yet migrated
  }
}