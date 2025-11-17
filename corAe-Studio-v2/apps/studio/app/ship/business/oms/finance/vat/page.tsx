// apps/studio/app/ship/business/oms/finance/vat/page.tsx
'use client';

/**
 * Finance — VAT
 * - Period-aware VAT dashboard (day, week, month, quarter, FY, custom)
 * - Summarises Output VAT (Sales) and Input VAT (Purchases)
 * - Shows Net VAT due (or reclaimable if negative)
 * - Bottom arrows: back → Purchases, next → Bank (cashbook)
 *
 * NOTE: Demo data only — replace with API fetch when ready.
 */

import React, { useEffect, useMemo, useState } from 'react';
// ✅ Use the long relative UI imports you confirmed work
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Separator } from '@/ui/separator';
import ArrowNav from '@/components/navigation/ArrowNav';

import PeriodFilter, {
  computeRange,
  type PeriodValue,
} from '../../../../../../../../src/components/finance/PeriodFilter';

type VatLine = {
  id: string;
  date_iso: string;
  party: string;          // customer or supplier
  ref?: string;           // SO/PO/INV/BILL ref
  net_minor: number;      // net amount in minor units
  vat_minor: number;      // VAT component in minor units
  kind: 'output' | 'input'; // output = sales VAT, input = purchases VAT
};

const money = (m: number) => `£${(m / 100).toFixed(2)}`;

export default function VatPage() {
  // Flat period value (so period.from / period.to always exist)
  const [period, setPeriod] = useState<PeriodValue>(() => computeRange('quarter'));

  const [rows, setRows] = useState<VatLine[]>([]);
  const [q, setQ] = useState('');

  // Seed demo VAT lines (mirror your ledgers’ style)
  useEffect(() => {
    const demo: VatLine[] = [
      // Output VAT (Sales)
      { id: 'INV-1001', date_iso: '2025-03-01', party: 'Choice Plus Supermarket', ref: 'SO-4451', net_minor: 142500, vat_minor: 28500, kind: 'output' },
      { id: 'INV-1002', date_iso: '2025-03-10', party: 'Al Amba Restaurant',     ref: 'SO-4462', net_minor:  86500, vat_minor: 17300, kind: 'output' },
      { id: 'INV-1003', date_iso: '2025-03-28', party: 'Glam & Glow Salon',       ref: 'SO-4490', net_minor:  45500, vat_minor:  9100, kind: 'output' },

      // Input VAT (Purchases)
      { id: 'BILL-2001', date_iso: '2025-03-02', party: 'Obari Logistics Ltd',    ref: 'PO-8851', net_minor:  91500, vat_minor: 18300, kind: 'input' },
      { id: 'BILL-2002', date_iso: '2025-03-12', party: 'Fresh Farms Wholesale',  ref: 'PO-8859', net_minor:  48600, vat_minor:  9720, kind: 'input' },
      { id: 'BILL-2003', date_iso: '2025-03-27', party: 'SalonPro Supplies',      ref: 'PO-8888', net_minor:  33100, vat_minor:  6620, kind: 'input' },
    ];
    setRows(demo);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const fromTs = new Date(period.from).getTime();
    const toTs   = new Date(period.to).getTime();

    return rows.filter((r) => {
      const t = new Date(r.date_iso).getTime();
      const inRange = t >= fromTs && t <= toTs;
      const hit =
        !term ||
        [r.id, r.party, r.ref ?? '', r.kind].join(' ').toLowerCase().includes(term);
      return inRange && hit;
    });
  }, [rows, q, period]);

  const summary = useMemo(() => {
    const outNet = filtered.filter(r => r.kind === 'output').reduce((a, r) => a + r.net_minor, 0);
    const outVat = filtered.filter(r => r.kind === 'output').reduce((a, r) => a + r.vat_minor, 0);
    const inNet  = filtered.filter(r => r.kind === 'input').reduce((a, r) => a + r.net_minor, 0);
    const inVat  = filtered.filter(r => r.kind === 'input').reduce((a, r) => a + r.vat_minor, 0);

    const netDue = outVat - inVat; // positive: owe HMRC; negative: reclaim
    return { outNet, outVat, inNet, inVat, netDue };
  }, [filtered]);

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">VAT</h1>
        <p className="muted">Output vs Input VAT for the selected period.</p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Period + search */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <PeriodFilter value={period} onChange={setPeriod} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search party, ref, id…"
                className="rounded-md border px-3 py-2 bg-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Export CSV</Button>
              <Button>Prepare Return</Button>
            </div>
          </div>

          <Separator />

          {/* Summary cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-sm">
            <Stat label="Output Net" value={money(summary.outNet)} />
            <Stat label="Output VAT" value={money(summary.outVat)} />
            <Stat label="Input Net"  value={money(summary.inNet)} />
            <Stat label="Input VAT"  value={money(summary.inVat)} />
            <Stat
              label={summary.netDue >= 0 ? 'Net VAT Due' : 'VAT Reclaim'}
              value={money(Math.abs(summary.netDue))}
            />
          </div>

          <Separator />

          {/* Lines */}
          <div className="grid gap-2">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-xl border p-3 bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono font-semibold">{r.id}</div>
                    <div className="text-xs text-muted">
                      {r.kind.toUpperCase()} • {r.party} • {r.ref ?? '—'} • {r.date_iso}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div>Net: <span className="font-medium">{money(r.net_minor)}</span></div>
                    <div className="text-xs text-muted">VAT {money(r.vat_minor)}</div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-sm text-muted">No VAT lines in this period.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/ship/business/oms/finance/purchases"
        nextHref="/ship/business/oms/finance/bank"
        nextLabel="Bank / Cashbook"
      >
        Finance · VAT
      </ArrowNav>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3 bg-card">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}