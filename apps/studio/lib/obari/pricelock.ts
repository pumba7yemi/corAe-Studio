import type { BTDO, PriceLockSnapshot, Order, Report, Invoice } from './model';

export function snapshotPriceLock(btdo: BTDO): PriceLockSnapshot {
  return {
    btdoId: btdo.id,
    counterpartType: btdo.counterpartType,
    counterpartName: btdo.counterpartName,
    contactName: btdo.contactName,
    contactEmail: btdo.contactEmail,
    contactPhone: btdo.contactPhone,
    currency: btdo.currency,
    unitPrice: btdo.unitPrice,
    unitDesc: btdo.unitDesc,
    taxRate: btdo.taxRate,
    paymentTerms: btdo.paymentTerms,
  };
}

// Compute invoice strictly from the lock + order + report (copy-through principle)
export function computeInvoice(
  order: Order,
  report: Report | null
): Pick<Invoice, 'subtotal' | 'adjustmentsTotal' | 'tax' | 'total' | 'currency'> {
  const currency = order.lock.currency;
  const subtotal = round(order.lock.unitPrice * order.quantity);
  const adjustmentsTotal = round((report?.adjustments ?? []).reduce((s, a) => s + a.amount, 0));
  const base = round(subtotal + adjustmentsTotal);
  const taxRatePct = order.lock.taxRate ?? 0;
  const tax = round(base * (taxRatePct / 100));
  const total = round(base + tax);
  return { currency, subtotal, adjustmentsTotal, tax, total };
}

function round(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }
