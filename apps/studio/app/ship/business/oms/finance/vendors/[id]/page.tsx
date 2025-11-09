'use client';

/**
 * Finance — Vendor Statement (AP)
 * - Shows one supplier’s AP documents within a period
 * - Running balance (bills add, payments/credits subtract)
 * - Quick search, actions: Add Payment / Post Bill (demo)
 * - Bottom arrows: back → Vendors, next → Purchases Ledger
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// ✅ Long relative paths
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
type APDocType = 'bill' | 'payment' | 'credit' | 'grn';

type Vendor = {
  id: string;
  name: string;
  terms?: string;
};

type APDoc = {
  id: string;
  type: APDocType;
  date_iso: string;
  due_iso?: string;
  ref?: string;
  description?: string;
  net_minor: MoneyMinor;
  vat_minor: MoneyMinor;
  paid_minor?: MoneyMinor;
  status?: 'draft' | 'posted' | 'overdue' | 'paid' | 'part-paid';
};

const money = (m: number) => `£${(m / 100).toFixed(2)}`;
const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));

export default function VendorStatementPage() {
  const params = useParams<{ id: string }>();
  const vendorId = decodeURIComponent(params?.id ?? '');

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [docs, setDocs] = useState<APDoc[]>([]);
  const [q, setQ] = useState('');

  const [period, setPeriod] = useState<PeriodValue>(() => ({
    kind: 'month',
    ...computeRange('month'),
  }));

  useEffect(() => {
    const all: Vendor[] = [
      { id: 'SUP-001', name: 'Obari Logistics Ltd', terms: '30 days' },
      { id: 'SUP-002', name: 'Fresh Farms Wholesale', terms: 'EOM+30' },
      { id: 'SUP-003', name: 'SalonPro Supplies', terms: 'EOM+14' },
      { id: 'SUP-004', name: 'VS Maintenance Services', terms: '30 days' },
      { id: 'SUP-005', name: 'GymGear UK', terms: 'Immediate' },
    ];
    setVendor(all.find((x) => x.id === vendorId) ?? { id: vendorId, name: vendorId });

    const demo: Record<string, APDoc[]> = {
      'SUP-001': [
        {
          id: 'BILL-2001',
          type: 'bill',
          date_iso: '2025-03-02',
          due_iso: '2025-04-01',
          ref: 'PO-8851',
          description: 'Transport services',
          net_minor: 91500,
          vat_minor: 18300,
          paid_minor: 109800,
          status: 'paid',
        },
      ],
      'SUP-002': [
        {
          id: 'BILL-2002',
          type: 'bill',
          date_iso: '2025-03-12',
          due_iso: '2025-04-11',
          ref: 'PO-8859',
          description: 'Produce supply',
          net_minor: 48600,
          vat_minor: 9720,
          paid_minor: 20000,
          status: 'part-paid',
        },
      ],
      'SUP-003': [
        {
          id: 'BILL-2003',
          type: 'bill',
          date_iso: '2025-03-27',
          due_iso: '2025-04-26',
          ref: 'PO-8888',
          description: 'Salon consumables',
          net_minor: 33100,
          vat_minor: 6620,
          paid_minor: 0,
          status: 'posted',
        },
      ],
      'SUP-004': [
        {
          id: 'BILL-2004',
          type: 'bill',
          date_iso: '2025-02-18',
          due_iso: '2025-03-20',
          ref: 'PO-8802',
          description: 'Maintenance visit',
          net_minor: 74000,
          vat_minor: 14800,
          paid_minor: 0,
          status: 'overdue',
        },
      ],
      'SUP-005': [
        {
          id: 'BILL-2005',
          type: 'bill',
          date_iso: '2025-03-31',
          due_iso: '2025-04-30',
          ref: 'PO-8901',
          description: 'Equipment',
          net_minor: 21800,
          vat_minor: 4360,
          paid_minor: 0,
          status: 'draft',
        },
      ],
    };
    setDocs(demo[vendorId] ?? []);
  }, [vendorId]);

  const inPeriod = useMemo(() => {
    const term = q.trim().toLowerCase();
    const fromTs = new Date(period.from).getTime();
    const toTs = new Date(period.to).getTime();

    const list = docs
      .filter((d) => {
        const t = new Date(d.date_iso).getTime();
        const within = t >= fromTs && t <= toTs;
        const hit =
          !term ||
          [d.id, d.ref ?? '', d.description ?? ''].join(' ').toLowerCase().includes(term);
        return within && hit;
      })
      .sort((a, b) => {
        const d = a.date_iso.localeCompare(b.date_iso);
        return d !== 0 ? d : a.id.localeCompare(b.id);
      });

    return list;
  }, [docs, period, q]);

  const computed = useMemo(() => {
    let balance = 0; // AP balance (positive = we owe supplier)
    const lines = inPeriod.map((d) => {
      const gross = d.net_minor + d.vat_minor;
      const delta = d.type === 'bill' ? gross : -gross;
      balance += delta;

      const outstanding =
        d.type === 'bill' ? Math.max(0, gross - (d.paid_minor ?? 0)) : 0;

      const overdueDays =
        outstanding > 0 && d.due_iso
          ? Math.max(0, daysBetween(d.due_iso, new Date().toISOString()))
          : 0;

      return { ...d, gross, delta, balance, outstanding, overdueDays };
    });

    const billsGross = lines.filter(l => l.type === 'bill').reduce((a, l) => a + l.gross, 0);
    const payments = lines.filter(l => l.type === 'payment' || l.type === 'credit').reduce((a, l) => a + Math.abs(l.delta), 0);
    const outstanding = lines.filter(l => l.type === 'bill').reduce((a, l) => a + l.outstanding, 0);

    return { lines, billsGross, payments, outstanding, endingBalance: balance };
  }, [inPeriod]);

  function addPayment() {
    const amt = 30000; // £300 demo
    const today = new Date().toISOString().slice(0, 10);
    setDocs((cur) => [
      ...cur,
      {
        id: `PAY-${vendorId}-${today}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'payment',
        date_iso: today,
        ref: 'BACS (demo)',
        description: 'Payment to supplier',
        net_minor: amt,
        vat_minor: 0,
      },
    ]);
  }

  function postBill() {
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
    setDocs((cur) => [
      ...cur,
      {
        id: `BILL-${2000 + cur.length + 1}`,
        type: 'bill',
        date_iso: today,
        due_iso: due,
        ref: 'PO-NEW',
        description: 'Ad-hoc supplies',
        net_minor: 15000,
        vat_minor: 3000,
        paid_minor: 0,
        status: 'posted',
      },
    ]);
  }

  if (!vendor) {
    return (
      <main className="p-6">
        <div className="text-sm text-muted">Loading…</div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Vendor · {vendor.name}</h1>
        <p className="muted">Statement & activity — Terms: {vendor.terms ?? '—'} · ID: {vendor.id}</p>
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
                Period:&nbsp;<span className="font-mono">{period.from} → {period.to}</span>
              </div>
            </div>
            <div className="row">
              <Button variant="outline" onClick={() => alert('Export (demo)')}>Export</Button>
              <Button variant="outline" onClick={postBill}>Post Bill</Button>
              <Button onClick={addPayment}>+ Add Payment</Button>
            </div>
          </div>

          {/* Period filter */}
          <div className="mt-1">
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <Separator />

          {/* Totals */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <Stat label="Bills (gross)" value={money(computed.billsGross)} />
            <Stat label="Payments/Credits" value={money(computed.payments)} />
            <Stat label="Outstanding (docs in view)" value={money(computed.outstanding)} />
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
                      {(l.type === 'payment' || l.type === 'credit') ? 'Payment' : 'Gross'}:{' '}
                      <span className="font-semibold">{money(Math.abs(l.delta))}</span>
                    </div>
                    <div className="text-xs text-muted">
                      Balance → <span className="font-mono">{money(l.balance)}</span>
                    </div>
                  </div>
                </div>

                {l.type === 'bill' && (
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
                        {(l.status ?? 'posted').toUpperCase()}
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

          {/* Links */}
          <div className="text-xs text-muted">
            Back to{' '}
            <Link href="/ship/business/oms/finance/vendors" className="underline">
              Vendors
            </Link>{' '}
            · View{' '}
            <Link href="/ship/business/oms/finance/purchase" className="underline">
              Purchases Ledger
            </Link>
          </div>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/ship/business/oms/finance/vendors"
        nextHref="/ship/business/oms/finance/purchases"
        nextLabel="Purchases Ledger"
      >
        Finance · Vendor Statement
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