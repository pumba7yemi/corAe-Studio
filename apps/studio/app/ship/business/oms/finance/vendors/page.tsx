'use client';

/**
 * Finance — Vendors (AP index)
 * - Lists suppliers with quick search and current balance
 * - Click through to individual Vendor Statement ([id])
 * - Bottom arrows: back → Finance Hub, next → Purchases Ledger
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

// ✅ Long relative paths (consistent with your working imports)
import { Card, CardContent } from '../../../../../../../../src/components/ui/card';
import { Button } from '../../../../../../../../src/components/ui/button';
import { Input } from '../../../../../../../../src/components/ui/input';
import { Separator } from '../../../../../../../../src/components/ui/separator';

import ArrowNav from '@/components/navigation/ArrowNav';
import PeriodFilter, {
  computeRange,
  type PeriodValue,
} from '../../../../../../../../src/components/finance/PeriodFilter';

type Vendor = {
  id: string;
  name: string;
  terms?: string;
  defaultCurrency?: string;
};

type MoneyMinor = number;
const money = (m: number) => `£${(m / 100).toFixed(2)}`;

type APDocType = 'bill' | 'payment' | 'credit' | 'grn';
type APDoc = {
  vendor_id: string;
  id: string;
  type: APDocType;
  date_iso: string;
  due_iso?: string;
  ref?: string;
  net_minor: MoneyMinor;
  vat_minor: MoneyMinor;
  paid_minor?: MoneyMinor;
  status?: 'draft' | 'posted' | 'overdue' | 'paid' | 'part-paid';
};

export default function VendorsIndexPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [docs, setDocs] = useState<APDoc[]>([]);
  const [q, setQ] = useState('');

  const [period, setPeriod] = useState<PeriodValue>(() => ({
    kind: 'month',
    ...computeRange('month'),
  }));

  // Seed demo vendors + docs (replace with API later)
  useEffect(() => {
    setVendors([
      { id: 'SUP-001', name: 'Obari Logistics Ltd', terms: '30 days' },
      { id: 'SUP-002', name: 'Fresh Farms Wholesale', terms: 'EOM+30' },
      { id: 'SUP-003', name: 'SalonPro Supplies', terms: 'EOM+14' },
      { id: 'SUP-004', name: 'VS Maintenance Services', terms: '30 days' },
      { id: 'SUP-005', name: 'GymGear UK', terms: 'Immediate' },
    ]);

    setDocs([
      {
        vendor_id: 'SUP-001',
        id: 'BILL-2001',
        type: 'bill',
        date_iso: '2025-03-02',
        due_iso: '2025-04-01',
        ref: 'PO-8851',
        net_minor: 91500,
        vat_minor: 18300,
        paid_minor: 109800,
        status: 'paid',
      },
      {
        vendor_id: 'SUP-002',
        id: 'BILL-2002',
        type: 'bill',
        date_iso: '2025-03-12',
        due_iso: '2025-04-11',
        ref: 'PO-8859',
        net_minor: 48600,
        vat_minor: 9720,
        paid_minor: 20000,
        status: 'part-paid',
      },
      {
        vendor_id: 'SUP-003',
        id: 'BILL-2003',
        type: 'bill',
        date_iso: '2025-03-27',
        due_iso: '2025-04-26',
        ref: 'PO-8888',
        net_minor: 33100,
        vat_minor: 6620,
        paid_minor: 0,
        status: 'posted',
      },
      {
        vendor_id: 'SUP-004',
        id: 'BILL-2004',
        type: 'bill',
        date_iso: '2025-02-18',
        due_iso: '2025-03-20',
        ref: 'PO-8802',
        net_minor: 74000,
        vat_minor: 14800,
        paid_minor: 0,
        status: 'overdue',
      },
      {
        vendor_id: 'SUP-005',
        id: 'BILL-2005',
        type: 'bill',
        date_iso: '2025-03-31',
        due_iso: '2025-04-30',
        ref: 'PO-8901',
        net_minor: 21800,
        vat_minor: 4360,
        paid_minor: 0,
        status: 'draft',
      },
    ]);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const fromTs = new Date(period.from).getTime();
    const toTs = new Date(period.to).getTime();

    // Compute vendor period balance (gross bills minus payments/credits)
    const summaries = vendors
      .filter((v) => !term || v.name.toLowerCase().includes(term) || v.id.toLowerCase().includes(term))
      .map((v) => {
        const vDocs = docs.filter((d) => {
          if (d.vendor_id !== v.id) return false;
          const t = new Date(d.date_iso).getTime();
          return t >= fromTs && t <= toTs;
        });

        const grossBills = vDocs
          .filter((d) => d.type === 'bill')
          .reduce((a, d) => a + d.net_minor + d.vat_minor, 0);
        const payments = vDocs
          .filter((d) => d.type === 'payment' || d.type === 'credit')
          .reduce((a, d) => a + d.net_minor + d.vat_minor, 0);

        const balance = grossBills - payments;
        const openBills = vDocs.filter((d) => d.type === 'bill' && (d.status === 'posted' || d.status === 'overdue' || d.status === 'part-paid'));
        const overdue = openBills.filter((d) => d.status === 'overdue').length;

        return {
          vendor: v,
          balance,
          openCount: openBills.length,
          overdueCount: overdue,
        };
      });

    // Sort by balance desc
    summaries.sort((a, b) => b.balance - a.balance);
    return summaries;
  }, [vendors, docs, q, period]);

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <p className="muted">Supplier list & current balances (AP).</p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vendors…" />
            </div>
            <div className="row">
              <Button onClick={() => alert('Add Vendor (demo)')}>+ Add Vendor</Button>
            </div>
          </div>

          <div className="mt-2">
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <Separator />

          <div className="grid gap-2">
            {filtered.map(({ vendor, balance, openCount, overdueCount }) => (
              <Link key={vendor.id} href={`/ship/business/oms/finance/vendors/${encodeURIComponent(vendor.id)}`}>
                <div className="rounded-xl border p-3 bg-card hover:bg-surface transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{vendor.name}</div>
                      <div className="text-xs text-muted">ID {vendor.id} • Terms {vendor.terms ?? '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        Balance: <span className="font-semibold">{money(balance)}</span>
                      </div>
                      <div className="text-xs text-muted">
                        Open {openCount} • Overdue {overdueCount}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="text-sm text-muted">No vendors match your filters.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/ship/business/oms/finance"
        nextHref="/ship/business/oms/finance/purchases"
        nextLabel="Purchases Ledger"
      >
        Finance · Vendors
      </ArrowNav>
    </main>
  );
}