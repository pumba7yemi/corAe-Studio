// apps/studio/app/ship/business/oms/finance/sales/page.tsx
'use client';

/**
 * Finance — Sales Ledger (AR)
 * - Lists sales invoices with quick filters & totals
 * - Uses PeriodFilter that returns { kind, from, to } (flat)
 * - Bottom arrows: back → Finance Hub, next → Purchases Ledger
 */

import React, { useEffect, useMemo, useState } from 'react';
// ✅ Use the long relative path you said works right now
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Separator } from '@/ui/separator';
import ArrowNav from '@/components/navigation/ArrowNav';

// ⬇️ Your PeriodFilter (flat shape)
import PeriodFilter, { computeRange, type PeriodValue } from '../../../../../../../../src/components/finance/PeriodFilter';

type SalesInvoice = {
  id: string;
  date_iso: string;
  due_iso: string;
  customer: string;
  ref?: string;
  net_minor: number;
  vat_minor: number;
  paid_minor: number;
  status: 'draft' | 'issued' | 'overdue' | 'paid' | 'part-paid';
};

const money = (m: number) => `£${(m / 100).toFixed(2)}`;
const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));

export default function SalesLedgerPage() {
  const [rows, setRows] = useState<SalesInvoice[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | SalesInvoice['status']>('all');

  // ✅ Flat default so period.from / period.to always exist
  const [period, setPeriod] = useState<PeriodValue>(() => computeRange('month'));

  // demo data
  useEffect(() => {
    const demo: SalesInvoice[] = [
      { id: 'INV-1001', date_iso: '2025-03-01', due_iso: '2025-03-31', customer: 'Choice Plus Supermarket', ref: 'SO-4451', net_minor: 142500, vat_minor: 28500, paid_minor: 171000, status: 'paid' },
      { id: 'INV-1002', date_iso: '2025-03-10', due_iso: '2025-04-09', customer: 'Al Amba Restaurant',      ref: 'SO-4462', net_minor:  86500, vat_minor: 17300, paid_minor:  60000, status: 'part-paid' },
      { id: 'INV-1003', date_iso: '2025-03-28', due_iso: '2025-04-27', customer: 'Glam & Glow Salon',        ref: 'SO-4490', net_minor:  45500, vat_minor:  9100, paid_minor:      0, status: 'issued' },
      { id: 'INV-1004', date_iso: '2025-02-20', due_iso: '2025-03-22', customer: 'VS Property Group',        ref: 'SO-4402', net_minor: 123000, vat_minor: 24600, paid_minor:      0, status: 'overdue' },
      { id: 'INV-1005', date_iso: '2025-03-31', due_iso: '2025-04-30', customer: 'Grace & Grit Gym',         ref: 'SO-4501', net_minor:  29900, vat_minor:  5980, paid_minor:      0, status: 'draft' },
    ];
    setRows(demo);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const fromTs = new Date(period.from).getTime();
    const toTs   = new Date(period.to).getTime();

    return rows.filter((r) => {
      const ts = new Date(r.date_iso).getTime();
      const inRange = ts >= fromTs && ts <= toTs;
      const okStatus = status === 'all' ? true : r.status === status;
      const okTerm =
        !term ||
        [r.id, r.customer, r.ref ?? '', r.status].join(' ').toLowerCase().includes(term);
      return inRange && okStatus && okTerm;
    });
  }, [rows, q, status, period]);

  const totals = useMemo(() => {
    const net = filtered.reduce((a, r) => a + r.net_minor, 0);
    const vat = filtered.reduce((a, r) => a + r.vat_minor, 0);
    const gross = net + vat;
    const paid = filtered.reduce((a, r) => a + r.paid_minor, 0);
    return { net, vat, gross, paid, due: gross - paid };
  }, [filtered]);

  function markPaid(id: string) {
    setRows((list) =>
      list.map((r) =>
        r.id !== id ? r : { ...r, paid_minor: r.net_minor + r.vat_minor, status: 'paid' }
      )
    );
  }

  function issueDraft(id: string) {
    setRows((list) =>
      list.map((r) =>
        r.id !== id ? r : { ...r, status: 'issued', date_iso: new Date().toISOString().slice(0, 10) }
      )
    );
  }

  function createInvoice() {
    const n = rows.length + 1001;
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
    setRows([
      {
        id: `INV-${n}`,
        date_iso: today,
        due_iso: due,
        customer: 'New Customer',
        ref: 'SO-NEW',
        net_minor: 10000,
        vat_minor: 2000,
        paid_minor: 0,
        status: 'draft',
      },
      ...rows,
    ]);
  }

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Sales Invoices</h1>
        <p className="muted">Accounts Receivable ledger (demo data).</p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input
                value={q}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
                placeholder="Search id, customer, ref…"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="rounded-md border px-3 py-2 bg-transparent"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="overdue">Overdue</option>
                <option value="part-paid">Part-paid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <Button onClick={createInvoice}>+ New Invoice</Button>
          </div>

          {/* Period Filter */}
          <div className="mt-3">
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <Separator />

          {/* List */}
          <div className="grid gap-3">
            {filtered.map((r) => {
              const gross = r.net_minor + r.vat_minor;
              const outstanding = gross - r.paid_minor;
              const overdueDays =
                r.status === 'overdue'
                  ? Math.max(0, daysBetween(r.due_iso, new Date().toISOString()))
                  : 0;

              return (
                <div key={r.id} className="rounded-xl border p-3 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="font-mono font-semibold">{r.id}</div>
                      <div className="text-xs text-muted">
                        {r.customer} • Ref {r.ref ?? '—'} • Issued {r.date_iso} • Due {r.due_iso}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        Gross: <span className="font-medium">{money(gross)}</span>
                      </div>
                      <div className="text-xs text-muted">
                        Paid {money(r.paid_minor)} • Due {money(outstanding)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs">
                      <span
                        className={[
                          'px-2 py-0.5 rounded-full border',
                          r.status === 'paid'
                            ? 'text-emerald-400 border-emerald-600/40'
                            : r.status === 'overdue'
                            ? 'text-red-400 border-red-600/40'
                            : r.status === 'part-paid'
                            ? 'text-amber-400 border-amber-600/40'
                            : 'text-slate-300 border-slate-600/40',
                        ].join(' ')}
                      >
                        {r.status.toUpperCase()}
                        {overdueDays ? ` • ${overdueDays}d` : ''}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {r.status === 'draft' && (
                        <Button variant="outline" onClick={() => issueDraft(r.id)}>
                          Issue
                        </Button>
                      )}
                      {r.status !== 'paid' && (
                        <Button variant="default" onClick={() => markPaid(r.id)}>
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-sm text-muted">No invoices match your filters.</div>
            )}
          </div>

          <Separator />

          {/* Totals */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
            <Stat label="Net" value={money(totals.net)} />
            <Stat label="VAT" value={money(totals.vat)} />
            <Stat label="Gross" value={money(totals.gross)} />
            <Stat label="Allocated" value={money(totals.paid)} />
            <Stat label="Outstanding" value={money(totals.due)} />
          </div>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/ship/business/oms/finance"
        nextHref="/ship/business/oms/finance/purchase"
        nextLabel="Purchase Ledger"
      >
        Finance · Sales Ledger
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