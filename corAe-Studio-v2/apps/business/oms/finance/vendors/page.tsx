'use client';

/**
 * Finance â€” Vendors (AP index)
 * Lightweight demo page used in local builds.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/ui/card';
// Local fallback Button component used when '@/ui/button' is not available
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...rest }) => (
  <button
    className={[
      'inline-flex items-center px-3 py-1 rounded-md bg-primary text-white',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  >
    {children}
  </button>
);
import { Input } from '@/ui/input';
import { Separator } from '@/ui/separator';
import ArrowNav from '@/components/navigation/ArrowNav';
import PeriodFilter, { computeRange, type PeriodValue } from '../../../../../../../../src/components/finance/PeriodFilter';
import Link from 'next/link';

type Vendor = { id: string; name: string; terms?: string };
type Doc = {
  vendor_id: string;
  id: string;
  type: 'bill' | 'payment' | 'credit';
  date_iso: string;
  due_iso?: string;
  ref?: string;
  net_minor: number;
  vat_minor: number;
  paid_minor: number;
  status?: string;
};

const money = (m: number) => `Â£${(m / 100).toFixed(2)}`;

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [q, setQ] = useState('');

  const [period, setPeriod] = useState<PeriodValue>(() => computeRange('month'));

  useEffect(() => {
    setVendors([
      { id: 'SUP-001', name: 'Obari Logistics Ltd', terms: '30 days' },
      { id: 'SUP-002', name: 'Fresh Farms Wholesale', terms: 'EOM+30' },
      { id: 'SUP-003', name: 'SalonPro Supplies', terms: 'EOM+14' },
      { id: 'SUP-004', name: 'VS Maintenance Services', terms: '30 days' },
      { id: 'SUP-005', name: 'GymGear UK', terms: 'Immediate' },
    ]);

    setDocs([
      { vendor_id: 'SUP-001', id: 'BILL-2001', type: 'bill', date_iso: '2025-03-02', due_iso: '2025-04-01', ref: 'PO-8851', net_minor: 91500, vat_minor: 18300, paid_minor: 109800, status: 'paid' },
      { vendor_id: 'SUP-002', id: 'BILL-2002', type: 'bill', date_iso: '2025-03-12', due_iso: '2025-04-11', ref: 'PO-8859', net_minor: 48600, vat_minor: 9720, paid_minor: 20000, status: 'part-paid' },
      { vendor_id: 'SUP-003', id: 'BILL-2003', type: 'bill', date_iso: '2025-03-27', due_iso: '2025-04-26', ref: 'PO-8888', net_minor: 33100, vat_minor: 6620, paid_minor: 0, status: 'posted' },
      { vendor_id: 'SUP-004', id: 'BILL-2004', type: 'bill', date_iso: '2025-02-18', due_iso: '2025-03-20', ref: 'PO-8802', net_minor: 74000, vat_minor: 14800, paid_minor: 0, status: 'overdue' },
      { vendor_id: 'SUP-005', id: 'BILL-2005', type: 'bill', date_iso: '2025-03-31', due_iso: '2025-04-30', ref: 'PO-8901', net_minor: 21800, vat_minor: 4360, paid_minor: 0, status: 'draft' },
    ]);
  }, []);

  const summaries = useMemo(() => {
    const term = q.trim().toLowerCase();
    const fromTs = new Date(period.from).getTime();
    const toTs = new Date(period.to).getTime();

    const byVendor = vendors.map((v) => {
      const vDocs = docs.filter((d) => d.vendor_id === v.id && new Date(d.date_iso).getTime() >= fromTs && new Date(d.date_iso).getTime() <= toTs);
      const balance = vDocs.reduce((a, d) => a + (d.net_minor + d.vat_minor - d.paid_minor), 0);
      const openBills = vDocs.filter((d) => d.type === 'bill' && (d.status === 'posted' || d.status === 'overdue' || d.status === 'part-paid'));
      const overdue = openBills.filter((d) => d.status === 'overdue').length;
      return { vendor: v, balance, openCount: openBills.length, overdueCount: overdue };
    });

    const filtered = byVendor.filter(({ vendor }) => {
      if (!term) return true;
      const t = `${vendor.id} ${vendor.name} ${vendor.terms ?? ''}`.toLowerCase();
      return t.includes(term);
    });

    filtered.sort((a, b) => b.balance - a.balance);
    return filtered;
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
              <Input value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} placeholder="Search vendorsâ€¦" />
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
            {summaries.map(({ vendor, balance, openCount, overdueCount }) => (
              <Link key={vendor.id} href={`/business/oms/finance/vendors/${encodeURIComponent(vendor.id)}`}>
                <div className="rounded-xl border p-3 bg-card hover:bg-surface transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{vendor.name}</div>
                      <div className="text-xs text-muted">ID {vendor.id} â€¢ Terms {vendor.terms ?? 'â€”'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        Balance: <span className="font-semibold">{money(balance)}</span>
                      </div>
                      <div className="text-xs text-muted">Open {openCount} â€¢ Overdue {overdueCount}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {summaries.length === 0 && <div className="text-sm text-muted">No vendors match your filters.</div>}
          </div>
        </CardContent>
      </Card>

      <ArrowNav backHref="/business/oms/finance" nextHref="/business/oms/finance/purchase" nextLabel="Purchase Ledger">
        Finance Â· Vendors
      </ArrowNav>
    </main>
  );
}

