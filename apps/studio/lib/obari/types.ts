// apps/studio/lib/obari/types.ts
export type Money = { currency: string; amount: number };

export type PriceLockRule = {
  id: string;
  basis: 'fixed' | 'index';
  fixedPrice?: Money;           // if basis=fixed
  indexCode?: string;           // if basis=index (e.g., 'LME-AL')
  indexFormula?: string;        // e.g., "index*1.03 + 12"
  expiresAt?: string;           // ISO date
};

export type PriceLockChain = {
  id: string;
  rules: PriceLockRule[];
  createdAt: string;
  lockedBy: string;             // user/org reference
};

export type Deal = {
  id: string;
  customerId: string;
  productCode: string;
  qtyEstimate: number;          // indicative volume
  priceLock: PriceLockChain;
  notes?: string;
  createdAt: string;
  status: 'draft' | 'brokered' | 'expired';
};

export type Booking = {
  id: string;
  dealId: string;
  startWeek: string;            // e.g., '2025-W36'
  weeks: number;                // number of delivery weeks
  weeklyQty: number;            // per week quantity
  createdAt: string;
  status: 'booked' | 'active' | 'completed' | 'cancelled';
};

export type WeekRun = {
  id: string;
  bookingId: string;
  week: string;                 // ISO week id
  plannedQty: number;
  executedQty: number;
  priceApplied: Money;
  createdAt: string;
  status: 'planned' | 'executed' | 'reconciled';
};
