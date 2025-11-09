'use client';

/**
 * Finance — Customers (AR Index)
 * - Lists customers with ageing buckets & totals
 * - PeriodFilter (day/week/month/quarter/FY/custom)
 * - Search by customer/ref
 * - Click a row to open the customer statement (/customers/[id])
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

// ✅ Use long relative paths (your current working style)
import { Card, CardContent } from '../../../../../../../../src/components/ui/card';
import { Button } from '../../../../../../../../src/components/ui/button';
import { Input } from '../../../../../../../../src/components/ui/input';
import { Separator } from '../../../../../../../../src/components/ui/separator';

import ArrowNav from '@/components/navigation/ArrowNav';
import PeriodFilter, {
  computeRange,
  type PeriodValue,
} from '../../../../../../../../src/components/finance/PeriodFilter';

type MoneyMinor = number;

type Customer = {
  id: string;
  name: string;
  terms?: string; // e.g. "EOM+30"
};

type ARDoc = {
  id: string; // INV-..., POSR-..., POSZ-...
  customer_id: string;
  customer_name: string;
  date_iso: string;
  due_iso: string;
  ref?: string;
  net_minor: MoneyMinor;
  vat_minor: MoneyMinor;
  paid_minor: MoneyMinor;
  status: 'draft' | 'issued' | 'overdue' | 'paid' | 'part-paid';
};

type RowAgg = {
  customer: Customer;
  net_minor: number;
  vat_minor: number;
  gross_minor: number;
  paid_minor: number;
  due_minor: number;
  ageing: { a0_30: number; a31_60: number; a61_90: number; a90p: number };
};

const money = (m: number) => `£${(m / 100).toFixed(2)}`;
const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));

export default function CustomersIndexPage() {
  // Demo data (replace with API later)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [docs, setDocs] = useState<ARDoc[]>([]);

  const [q, setQ] = useState('');
  const [period, setPeriod] = useState<PeriodValue>(() => ({
    kind: 'month',
    ...computeRange('month'),
  }));

  useEffect(() => {
    // seed customers
    setCustomers([
      { id: 'CUST-001', name: 'Choice Plus Supermarket', terms: 'EOM+30' },
      { id: 'CUST-002', name: 'Al Amba Restaurant', terms: '30 days' },
      { id: 'CUST-003', name: 'Glam & Glow Salon', terms: 'EOM+14' },
      { id: 'CUST-004', name: 'VS Property Group', terms: '30 days' },
      { id: 'CUST-005', name: 'Grace & Grit Gym', terms: 'Immediate' },
    ]);

    // seed AR docs (mix of SO invoices and POS)
    setDocs([
      // Choice Plus
      {
        id: 'INV-1001',
        customer_id: 'CUST-001',
        customer_name: 'Choice Plus Supermarket',
        date_iso: '2025-03-01',
        due_iso: '2025-03-31',
        ref: 'SO-4451',
        net_minor: 142500,
        vat_minor: 28500,
        paid_minor: 171000,
        status: 'paid',
      },
      // Al Amba
      {
        id: 'INV-1002',
        customer_id: 'CUST-002',
        customer_name: 'Al Amba Restaurant',
        date_iso: '2025-03-10',
        due_iso: '2025-04-09',
        ref: 'SO-4462',
        net_minor: 86500,
        vat_minor: 17300,
        paid_minor: 60000,
        status: 'part-paid',
      },
      // Glam & Glow
      {
        id: 'INV-1003',
        customer_id: 'CUST-003',
        customer_name: 'Glam & Glow Salon',
        date_iso: '2025-03-28',
        due_iso: '2025-04-27',
        ref: 'SO-4490',
        net_minor: 45500,
        vat_minor: 9100,
        paid_minor: 0,
        status: 'issued',
      },
      // VS Property — overdue
      {
        id: 'INV-1004',
        customer_id: 'CUST-004',
        customer_name: 'VS Property Group',
        date_iso: '2025-02-20',
        due_iso: '2025-03-22',
        ref: 'SO-4402',
        net_minor: 123000,
        vat_minor: 24600,
        paid_minor: 0,
        status: 'overdue',
      },
      // Grace & Grit — draft
      {
        id: 'INV-1005',
        customer_id: 'CUST-005',
        customer_name: 'Grace & Grit Gym',
        date_iso: '2025-03-31',
        due_iso: '2025-04-30',
        ref: 'SO-4501',
        net_minor: 29900,
        vat_minor: 5980,
        paid_minor: 0,
        status: 'draft',
      },

      // Example POS daily summary for Choice Plus
      {
        id: 'POSZ-CP-2025-03-31',
        customer_id: 'CUST-001',
        customer_name: 'Choice Plus Supermarket',
        date_iso: '2025-03-31',
        due_iso: '2025-03-31',
        ref: 'Z-2025-03-31',
        net_minor: 450000,
        vat_minor: 90000,
        paid_minor: 540000, // POS usually paid immediately
        status: 'paid',
      },
    ]);
  }, []);

  // Filter by period first (issue date)
  const docsInPeriod = useMemo(() => {
    const fromTs = new Date(period.from).getTime();
    const toTs = new Date(period.to).getTime();
    return docs.filter((d) => {
      const t = new Date(d.date_iso).getTime();
      return t >= fromTs && t <= toTs;
    });
  }, [docs, period]);

  // Aggregate by customer (respect search)
  const rows: RowAgg[] = useMemo(() => {
    const nowIso = new Date().toISOString().slice(0, 10);
    const today = new Date(nowIso).getTime();
    const term = q.trim().toLowerCase();

    const byCustomer = new Map<string, RowAgg>();

    for (const d of docsInPeriod) {
      const key = d.customer_id;
      const gross = d.net_minor + d.vat_minor;
      const outstanding = Math.max(0, gross - d.paid_minor);

      if (!byCustomer.has(key)) {
        const c = customers.find((c) => c.id === key) ?? {
          id: d.customer_id,
          name: d.customer_name,
        };
        byCustomer.set(key, {
          customer: c,
          net_minor: 0,
          vat_minor: 0,
          gross_minor: 0,
          paid_minor: 0,
          due_minor: 0,
          ageing: { a0_30: 0, a31_60: 0, a61_90: 0, a90p: 0 },
        });
      }

      const agg = byCustomer.get(key)!;
      agg.net_minor += d.net_minor;
      agg.vat_minor += d.vat_minor;
      agg.gross_minor += gross;
      agg.paid_minor += d.paid_minor;
      agg.due_minor += outstanding;

      // Ageing (only for outstanding > 0)
      if (outstanding > 0) {
        const days = Math.max(
          0,
          daysBetween(d.due_iso, new Date(today).toISOString())
        );
        if (days <= 30) agg.ageing.a0_30 += outstanding;
        else if (days <= 60) agg.ageing.a31_60 += outstanding;
        else if (days <= 90) agg.ageing.a61_90 += outstanding;
        else agg.ageing.a90p += outstanding;
      }
    }

    let list = Array.from(byCustomer.values());
    if (term) {
      list = list.filter((r) =>
        [r.customer.name, r.customer.id].join(' ').toLowerCase().includes(term)
      );
    }
    // Sort: highest due first
    list.sort((a, b) => b.due_minor - a.due_minor);
    return list;
  }, [customers, docsInPeriod, q]);

  const totals = useMemo(() => {
    const net = rows.reduce((a, r) => a + r.net_minor, 0);
    const vat = rows.reduce((a, r) => a + r.vat_minor, 0);
    const gross = rows.reduce((a, r) => a + r.gross_minor, 0);
    const paid = rows.reduce((a, r) => a + r.paid_minor, 0);
    const due = rows.reduce((a, r) => a + r.due_minor, 0);
    const a0_30 = rows.reduce((a, r) => a + r.ageing.a0_30, 0);
    const a31_60 = rows.reduce((a, r) => a + r.ageing.a31_60, 0);
    const a61_90 = rows.reduce((a, r) => a + r.ageing.a61_90, 0);
    const a90p = rows.reduce((a, r) => a + r.ageing.a90p, 0);
    return { net, vat, gross, paid, due, a0_30, a31_60, a61_90, a90p };
  }, [rows]);

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="muted">Accounts Receivable — balances & ageing per customer.</p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input
                value={q}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
                placeholder="Search customer…"
              />
            </div>
            {/* Export placeholder */}
            <Button variant="outline" onClick={() => alert('Export coming soon')}>
              Export
            </Button>
          </div>

          {/* Period Filter */}
          <div className="mt-1">
            {/* @ts-expect-error — fyStartMonth is accepted at runtime but not declared on the PeriodFilter props type */}
            <PeriodFilter value={period} onChange={setPeriod} fyStartMonth={4} />
          </div>

          <Separator />

          {/* List */}
          <div className="grid gap-2">
            {rows.map((r) => (
              <Link
                key={r.customer.id}
                href={`/ship/business/oms/finance/customers/${encodeURIComponent(r.customer.id)}`}
                className="rounded-xl border p-3 bg-card hover:bg-surface transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="font-semibold">{r.customer.name}</div>
                    <div className="text-xs text-muted">
                      {r.customer.id} • Terms: {r.customer.terms ?? '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      Due: <span className="font-medium">{money(r.due_minor)}</span>
                    </div>
                    <div className="text-xs text-muted">
                      Net {money(r.net_minor)} • VAT {money(r.vat_minor)} • Paid {money(r.paid_minor)}
                    </div>
                  </div>
                </div>

                {/* Ageing bars */}
                <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                  <AgeCell label="0–30" value={r.ageing.a0_30} />
                  <AgeCell label="31–60" value={r.ageing.a31_60} />
                  <AgeCell label="61–90" value={r.ageing.a61_90} />
                  <AgeCell label="90+" value={r.ageing.a90p} />
                </div>
              </Link>
            ))}

            {rows.length === 0 && (
              <div className="text-sm text-muted">No customers match your filters.</div>
            )}
          </div>

          <Separator />

          {/* Totals */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 text-sm">
            <Stat label="Net" value={money(totals.net)} />
            <Stat label="VAT" value={money(totals.vat)} />
            <Stat label="Gross" value={money(totals.gross)} />
            <Stat label="Allocated" value={money(totals.paid)} />
            <Stat label="Outstanding" value={money(totals.due)} />
            <div className="rounded-xl border p-3 bg-card">
              <div className="text-xs text-muted">Ageing</div>
              <div className="text-xs">
                0–30 {money(totals.a0_30)} • 31–60 {money(totals.a31_60)} • 61–90 {money(totals.a61_90)} • 90+ {money(totals.a90p)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/ship/business/oms/finance"
        nextHref="/ship/business/oms/finance/vendors"
        nextLabel="Vendors"
      >
        Finance · Customers
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

function AgeCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border px-3 py-1.5 bg-card flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{money(value)}</span>
    </div>
  );
}