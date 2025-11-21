// apps/studio/app/lib/BDO/finance/bdo-bridge.ts
/* ============================================================
   corAe Finance → BDO Bridge
   - Links OBARI Invoices & Finance Payments back to a BDO
   - Supports bill-to-bill credits and allocations
   - Keeps one commercial thread from sale → settlement
   ============================================================ */

export type PaymentPlan = "PRO_FORMA" | "ON_DELIVERY" | "BILL_TO_BILL" | "MONTH_END";
export type InvoiceDirection = "SALES" | "PURCHASE";

export interface InvoiceLinkPayload {
  bdoId: string;
  invoiceId: string;          // prisma Invoice.id
  invoiceNo: string;          // human ref
  direction: InvoiceDirection; // SALES / PURCHASE
  plan?: PaymentPlan;         // from finance.prisma
  grandTotal: number;         // AED
  issuedAt?: string;          // ISO
}

/** Called when OBARI issues an invoice */
export async function linkInvoiceToBDO(payload: InvoiceLinkPayload) {
  const res = await fetch("/api/bdo/link-invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to link invoice to BDO");
  console.info(`✅ BDO ${payload.bdoId} linked to invoice ${payload.invoiceNo}`);
  return data;
}

/* ---------------- Payments & Allocations ---------------- */

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "CHEQUE" | "MIXED";

export interface PaymentRecordPayload {
  bdoId: string;
  invoiceId: string;
  amount: number;            // amount applied to this invoice
  method: PaymentMethod;
  paidAt?: string;           // ISO
  reference?: string;        // bank txn / slip / POS ref
  notes?: string;
}

/** Records a payment and allocates it to the given invoice */
export async function recordPaymentAllocation(payload: PaymentRecordPayload) {
  const res = await fetch("/api/bdo/record-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to record payment allocation");
  console.info(`💸 Payment ${payload.amount} AED allocated to invoice ${payload.invoiceId} for BDO ${payload.bdoId}`);
  return data;
}

/* ---------------- Bill-to-Bill Credits ---------------- */

export interface CreditApplyPayload {
  bdoId: string;
  sourceInvoiceId: string;   // the invoice that created the credit
  applyToInvoiceId: string;  // the next invoice being offset
  amount: number;
}

/** Applies existing credit to a future invoice (bill-to-bill) */
export async function applyBillToBillCredit(payload: CreditApplyPayload) {
  const res = await fetch("/api/bdo/apply-credit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to apply bill-to-bill credit");
  console.info(`🔁 Applied credit ${payload.amount} AED from ${payload.sourceInvoiceId} → ${payload.applyToInvoiceId}`);
  return data;
}

/* ---------------- Convenience Orchestrators ---------------- */

/** One-shot: link invoice, then (optionally) schedule payment batch by plan */
export async function issueInvoiceAndSchedule(
  base: InvoiceLinkPayload,
  schedule?: { plan: PaymentPlan; scheduledForISO: string }
) {
  const link = await linkInvoiceToBDO(base);
  if (!schedule) return link;

  const res = await fetch("/api/bdo/schedule-payment-batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bdoId: base.bdoId,
      invoiceId: base.invoiceId,
      plan: schedule.plan,
      scheduledFor: schedule.scheduledForISO,
    }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to schedule payment batch");
  console.info(`🗓️ Scheduled ${schedule.plan} payment for invoice ${base.invoiceNo} on ${schedule.scheduledForISO}`);
  return { link, schedule: data };
}
