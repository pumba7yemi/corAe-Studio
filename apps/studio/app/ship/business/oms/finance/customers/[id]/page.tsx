'use client';

/**
 * Finance — Customer Statement (AR)
 * - Shows one customer's AR documents within a period
 * - Running balance (in/out), quick ageing, search
 * - Demo "Add Payment" action updates local state
 * - Bottom arrows: back → Customers, next → Sales Ledger
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// ✅ Long relative paths (as per your working setup)
import { Card, CardContent } from '../../../../../../../../../src/components/ui/card';
import { Button } from '../../../../../../../../../src/components/ui/button';
import { Input } from '../../../../../../../../../src/components/ui/input';
import { Separator } from '../../../../../../../../../src/components/ui/separator';

import ArrowNav from '@/components/navigation/ArrowNav';
import PeriodFilter, {
  computeRange,
  type PeriodValue,
} from '../../../../../../../../../src/components/finance/PeriodFilter';

type MoneyMinor = number;

type ARDocType = 'invoice' | 'pos' | 'payment' | 'credit';

type ARDoc = {
  id: string;                 // INV-..., POSZ-..., PAY-..., CRN-...
  type: ARDocType;
  date_iso: string;
  due_iso?: string;
  ref?: string;
  description?: string;
  net_minor: MoneyMinor;      // for payments/credits use positive number; we'll invert sign
  vat_minor: MoneyMinor;      // usually 0 for payments/credits
  paid_minor?: MoneyMinor;    // for invoices / pos docs only
  status?: 'draft' | 'issued' | 'overdue' | 'paid' | 'part-paid';
};

type Customer = {
  id: string;
  name: string;
  terms?: string;
};

const money = (m: number) => `£${(m / 100).toFixed(2)}`;
const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));

export default function CustomerStatementPage() {
  const params = useParams<{ id: string }>();
  const customerId = params?.id ? decodeURIComponent(params.id) : '';

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [docs, setDocs] = useState<ARDoc[]>([]);
  const [q, setQ] = useState('');

  // Flat PeriodValue: { kind, from, to }
  const [period, setPeriod] = useState<PeriodValue>(() => ({
    kind: 'month',
    ...computeRange('month'),
  }));

  // Seed demo data (replace with API later)
  useEffect(() => {
    const allCustomers: Customer[] = [
      { id: 'CUST-001', name: 'Choice Plus Supermarket', terms: 'EOM+30' },
      { id: 'CUST-002', name: 'Al Amba Restaurant', terms: '30 days' },
      { id: 'CUST-003', name: 'Glam & Glow Salon', terms: 'EOM+14' },
      { id: 'CUST-004', name: 'VS Property Group', terms: '30 days' },
      { id: 'CUST-005', name: 'Grace & Grit Gym', terms: 'Immediate' },
    ];

    const c = allCustomers.find((x) => x.id === customerId) ?? {
      id: customerId,
      name: customerId,
    };
    setCustomer(c);

    // Build a small doc set tailored to the customer
    const base: Record<string, ARDoc[]> = {
      'CUST-001': [
        {
          id: 'INV-1001',
          type: 'invoice',
          date_iso: '2025-03-01',
          due_iso: '2025-03-31',
          ref: 'SO-4451',
          description: 'Wholesale goods',
          net_minor: 142500,
          vat_minor: 28500,
          paid_minor: 171000,
          status: 'paid',
        },
        {
          id: 'POSZ-CP-2025-03-31',
          type: 'pos',
          date_iso: '2025-03-31',
          due_iso: '2025-03-31',
          ref: 'Z-2025-03-31',
          description: 'POS Daily Z Total',
          net_minor: 450000,
          vat_minor: 90000,
          paid_minor: 540000,
          status: 'paid',
        },
        {
          id: 'PAY-CP-2025-04-02',
          type: 'payment',
          date_iso: '2025-04-02',
          ref: 'BACS 12345',
          description: 'Customer payment',
          net_minor: 162000, // payment amount (gross, but store in net_minor)
          vat_minor: 0,
        },
      ],
      'CUST-002': [
        {
          id: 'INV-1002',
          type: 'invoice',
          date_iso: '2025-03-10',
          due_iso: '2025-04-09',
          ref: 'SO-4462',
          description: 'Weekly supply',
          net_minor: 86500,
          vat_minor: 17300,
          paid_minor: 60000,
          status: 'part-paid',
        },
      ],
    };

    setDocs(base[customerId] ?? []);
  }, [customerId]);

  // Apply period + search
  const inPeriod = useMemo(() => {
    const fromTs = new Date(period.from).getTime();
    const toTs = new Date(period.to).getTime();
    const term = q.trim().toLowerCase();

    const matches = docs.filter((d) => {
      const t = new Date(d.date_iso).getTime();
      const within = t >= fromTs && t <= toTs;
      const hit =
        !term ||
        [d.id, d.ref ?? '', d.description ?? ''].join(' ').toLowerCase().includes(term);
      return within && hit;
    });

    // Sort by date, then id for stable running balance
    matches.sort((a, b) => {
      const da = a.date_iso.localeCompare(b.date_iso);
      if (da !== 0) return da;
      return a.id.localeCompare(b.id);
    });

    return matches;
  }, [docs, period, q]);

  // Running balance & ageing
  const computed = useMemo(() => {
    let balance = 0; // running (gross) balance
    const lines = inPeriod.map((d) => {
      const gross = d.net_minor + d.vat_minor;
      // For payments/credits we subtract
      const delta =
        d.type === 'payment' || d.type === 'credit' ? -gross : gross;
      balance += delta;

      const outstanding =
        d.type === 'invoice' || d.type === 'pos'
          ? Math.max(0, gross - (d.paid_minor ?? 0))
          : 0;

      const overdueDays =
        outstanding > 0 && d.due_iso
          ? Math.max(0, daysBetween(d.due_iso, new Date().toISOString()))
          : 0;

      return {
        ...d,
        gross,
        delta,
        balance,
        outstanding,
        overdueDays,
      };
    });

    // Totals (for this period view)
    const grossSales = lines
      .filter((l) => l.type === 'invoice' || l.type === 'pos')
      .reduce((a, l) => a + l.gross, 0);
    const receipts = lines
      .filter((l) => l.type === 'payment' || l.type === 'credit')
      .reduce((a, l) => a + Math.abs(l.delta), 0);
    const invoicesOutstanding = lines
      .filter((l) => l.type === 'invoice' || l.type === 'pos')
      .reduce((a, l) => a + l.outstanding, 0);

    return { lines, grossSales, receipts, invoicesOutstanding, endingBalance: balance };
  }, [inPeriod]);

  function addPayment() {
    const amt = 50000; // £500.00 demo
    const today = new Date().toISOString().slice(0, 10);
    setDocs((cur) => [
      ...cur,
      {
        id: `PAY-${customerId}-${today}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'payment',
        date_iso: today,
        ref: 'BACS (demo)',
        description: 'Manual receipt (demo)',
        net_minor: amt,
        vat_minor: 0,
      },
    ]);
  }

  if (!customer) {
    return (
      <main className="p-6">
        <div className="text-sm text-muted">Loading…</div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Customer · {customer.name}</h1>
        <p className="muted">
          Statement & activity — Terms: {customer.terms ?? '—'} · ID: {customer.id}
        </p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search ref/description…"
              />
              <div className="text-xs text-muted">
                Period:&nbsp;
                <span className="font-mono">
                  {period.from} → {period.to}
                </span>
              </div>
            </div>

            <div className="row">
              <Button variant="outline" onClick={() => alert('Export coming soon')}>
                Export
              </Button>
              <Button onClick={addPayment}>+ Add Payment</Button>
            </div>
          </div>

          {/* Period Filter */}
          <div className="mt-1">
            <PeriodFilter value={period} onChange={(v) => setPeriod(v)} />
          </div>

          <Separator />

          {/* Totals overview */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <Stat label="Sales (gross)" value={money(computed.grossSales)} />
            <Stat label="Receipts" value={money(computed.receipts)} />
            <Stat label="Outstanding (docs in view)" value={money(computed.invoicesOutstanding)} />
            <Stat label="Ending Balance (running)" value={money(computed.endingBalance)} />
          </div>

          <Separator />

          {/* Lines */}
          <div className="grid gap-2">
            {computed.lines.map((l) => (
              <div key={l.id} className="rounded-xl border p-3 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="font-mono font-semibold">{l.id}</div>
                    <div className="text-xs text-muted">
                      {l.type.toUpperCase()} • {l.date_iso}
                      {l.ref ? ` • Ref ${l.ref}` : ''}
                      {l.description ? ` • ${l.description}` : ''}
                      {l.due_iso ? ` • Due ${l.due_iso}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {l.type === 'payment' || l.type === 'credit' ? 'Receipt' : 'Gross'}:{' '}
                      <span className="font-semibold">
                        {money(Math.abs(l.delta))}
                      </span>
                    </div>
                    <div className="text-xs text-muted">
                      Balance → <span className="font-mono">{money(l.balance)}</span>
                    </div>
                  </div>
                </div>

                {(l.type === 'invoice' || l.type === 'pos') && (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs">
                      <span
                        className={[
                          'px-2 py-0.5 rounded-full border',
                          l.status === 'paid'
                            ? 'text-emerald-400 border-emerald-600/40'
                            : l.status === 'overdue'
                            ? 'text-red-400 border-red-600/40'
                            : l.status === 'part-paid'
                            ? 'text-amber-400 border-amber-600/40'
                            : 'text-slate-300 border-slate-600/40',
                        ].join(' ')}
                      >
                        {(l.status ?? 'issued').toUpperCase()}
                        {l.overdueDays ? ` • ${l.overdueDays}d` : ''}
                      </span>
                    </div>
                    {!!l.outstanding && (
                      <div className="text-xs">
                        Outstanding: <span className="font-medium">{money(l.outstanding)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {computed.lines.length === 0 && (
              <div className="text-sm text-muted">No documents in this period.</div>
            )}
          </div>

          <Separator />

          {/* Quick links */}
          <div className="text-xs text-muted">
            Back to{' '}
            <Link href="/ship/business/oms/finance/customers" className="underline">
              Customers
            </Link>{' '}
            · View{' '}
            <Link href="/ship/business/oms/finance/sales" className="underline">
              Sales Ledger
            </Link>
          </div>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/ship/business/oms/finance/customers"
        nextHref="/ship/business/oms/finance/sales"
        nextLabel="Sales Ledger"
      >
        Finance · Customer Statement
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