// OBARI domain models (BTDO → BDO → PO/SO → Booking → Active → Report → Invoice)

export type ID = string;

// The originating deal (your BTDO). This is the foundation of the PriceLock chain.
export type BTDO = {
  id: ID;                       // BTDO-...
  createdAt: string;
  // Who & What
  counterpartType: 'vendor' | 'customer' | 'both';
  counterpartName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Pricelock basics (as agreed in the deal)
  currency: string;             // e.g. AED
  unitPrice: number;            // price per unit
  unitDesc: string;             // e.g. "kg", "tray", "case"
  taxRate?: number;             // %
  paymentTerms?: string;        // e.g. "30 days", "COD"
  notes?: string;

  // Optional validity
  validFrom?: string;           // ISO
  validTo?: string;             // ISO
};

// The BDO ties the pricelock to an intended order set (sales/purchase frame)
export type BDO = {
  id: ID;                       // BDO-...
  createdAt: string;
  btdoId: ID;
  type: 'sales' | 'purchase';   // your “BDO: SO or PO”
  // “Copy-through” snapshot from BTDO (immutable)
  lock: PriceLockSnapshot;
  // Optional framing details
  commodity?: string;
  route?: string;               // e.g. origin→destination
  ownerNotes?: string;
};

// PO/SO – A concrete order raised from a BDO
export type Order = {
  id: ID;                       // ORD-...
  createdAt: string;
  bdoId: ID;
  direction: 'SO' | 'PO';
  // “Copy-through” snapshot from BDO.lock
  lock: PriceLockSnapshot;
  // Order specifics
  quantity: number;
  requiredDate?: string;
  reference?: string;           // internal reference
  extReference?: string;        // vendor/customer PO/SO # if any
  notes?: string;
};

// Booking – slotting that order
export type Booking = {
  id: ID;                       // BKG-...
  createdAt: string;
  orderId: ID;
  week: number;
  day: number;                  // 1-7 if you want
  slot: 'AM' | 'PM' | 'EVE' | string;
  eta?: string;                 // ISO
  notes?: string;
};

// Active – the live window (in-flight)
export type Active = {
  id: ID;                       // ACT-...
  createdAt: string;
  orderId: ID;
  status: 'in-transit' | 'arrived' | 'delivered' | 'delayed' | 'exception';
  updatedAt: string;
  message?: string;
};

// Report – confirmation + adjustments (was “reconcile” → now “report”)
export type ReportAdjustment = { reason: string; amount: number }; // negatives for short, positives for add
export type Report = {
  id: ID;                       // RPT-...
  createdAt: string;
  orderId: ID;
  grvRef?: string;
  expiry?: string;              // ISO (e.g. shelf-life cutoff)
  adjustments: ReportAdjustment[];
  notes?: string;
};

// Invoice – final price from lock ± adjustments
export type Invoice = {
  id: ID;                       // INV-...
  createdAt: string;
  orderId: ID;
  invoiceRef?: string;
  currency: string;             // from lock
  subtotal: number;             // lock.unitPrice * order.quantity
  adjustmentsTotal: number;     // sum(adjustments.amount)
  tax: number;                  // (subtotal + adjustmentsTotal) * lock.taxRate%
  total: number;                // subtotal + adjustmentsTotal + tax
};

// The copy-through snapshot taken from BTDO → BDO → Order (immutable once copied)
export type PriceLockSnapshot = {
  btdoId: ID;
  counterpartType: 'vendor' | 'customer' | 'both';
  counterpartName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  currency: string;
  unitPrice: number;
  unitDesc: string;
  taxRate?: number;
  paymentTerms?: string;
};
