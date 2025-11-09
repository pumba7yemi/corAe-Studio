'use client';

/**
 * Finance — Profit & Loss (P&L)
 * - Periodised summary using demo data
 * - Sections: Revenue, COGS, Gross Profit, Expenses, Operating Profit, Net
 * - Bottom arrows: back → Finance Hub, next → Balance Sheet
 */

import React, { useEffect, useMemo, useState } from 'react';

// NOTE: one level deeper than Purchases → add one extra "../"
import { Card, CardContent } from '../../../../../../../../../src/components/ui/card';
import { Separator } from '../../../../../../../../../src/components/ui/separator';
import { Button } from '../../../../../../../../../src/components/ui/button';
import ArrowNav from '@/components/navigation/ArrowNav';

import PeriodFilter, {
  computeRange,
  type PeriodValue,
} from '../../../../../../../../../src/components/finance/PeriodFilter';

type Money = number; // minor (£ * 100)

type Sale = { date_iso: string; net_minor: Money; vat_minor: Money; };
type Purchase = { date_iso: string; net_minor: Money; vat_minor: Money; kind: 'cogs' | 'expense'; category?: string; };
type Other = { date_iso: string; net_minor: Money; label: string; sign: 1 | -1 }; // e.g., misc income/charges

const formatGBP = (m: number) => `£${(m / 100).toFixed(2)}`;

export default function PnLPage() {
  const [period, setPeriod] = useState<PeriodValue>(() => ({
    kind: 'month',
    ...computeRange('month'),
  }));

  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [other, setOther] = useState<Other[]>([]);

  useEffect(() => {
    // Demo data (can be replaced by API later)
    setSales([
      { date_iso: '2025-03-01', net_minor: 142500, vat_minor: 28500 },
      { date_iso: '2025-03-10', net_minor:  86500, vat_minor: 17300 },
      { date_iso: '2025-03-28', net_minor:  45500, vat_minor:  9100 },
      { date_iso: '2025-02-20', net_minor: 123000, vat_minor: 24600 },
      { date_iso: '2025-03-31', net_minor:  29900, vat_minor:  5980 },
    ]);
    setPurchases([
      // COGS (goods)
      { date_iso: '2025-03-05', net_minor: 52000, vat_minor: 10400, kind: 'cogs' },
      { date_iso: '2025-03-22', net_minor: 31800, vat_minor:  6360, kind: 'cogs' },
      // Expenses (OPEX)
      { date_iso: '2025-03-04', net_minor:  7800, vat_minor:  1560, kind: 'expense', category: 'Fuel' },
      { date_iso: '2025-03-18', net_minor: 12900, vat_minor:  2580, kind: 'expense', category: 'Supplies' },
      { date_iso: '2025-03-15', net_minor:  1200, vat_minor:     0, kind: 'expense', category: 'Bank fees' },
      { date_iso: '2025-03-08', net_minor: 25000, vat_minor:  5000, kind: 'expense', category: 'Rent' },
      { date_iso: '2025-03-09', net_minor: 14000, vat_minor:  2800, kind: 'expense', category: 'Utilities' },
    ]);
    setOther([
      { date_iso: '2025-03-12', net_minor:  2000, label: 'Interest received', sign: 1 },
      { date_iso: '2025-03-27', net_minor:  3500, label: 'Misc charge',       sign: -1 },
    ]);
  }, []);

  const inRange = (iso: string) => {
    const t = new Date(iso).getTime();
    return t >= new Date(period.from).getTime() && t <= new Date(period.to).getTime();
  };

  const calc = useMemo(() => {
    const rev = sales.filter(s => inRange(s.date_iso)).reduce((a, s) => a + s.net_minor, 0);

    const cogs = purchases
      .filter(p => p.kind === 'cogs' && inRange(p.date_iso))
      .reduce((a, p) => a + p.net_minor, 0);

    const gross = rev - cogs;

    const expenses = purchases
      .filter(p => p.kind === 'expense' && inRange(p.date_iso))
      .reduce((a, p) => a + p.net_minor, 0);

    const otherNet = other
      .filter(o => inRange(o.date_iso))
      .reduce((a, o) => a + o.sign * o.net_minor, 0);

    const operating = gross - expenses;
    const net = operating + otherNet;

    // Expense breakdown
    const expenseByCat = purchases
      .filter(p => p.kind === 'expense' && inRange(p.date_iso))
      .reduce<Record<string, number>>((acc, p) => {
        const key = p.category ?? 'Other';
        acc[key] = (acc[key] ?? 0) + p.net_minor;
        return acc;
      }, {});

    return { rev, cogs, gross, expenses, otherNet, operating, net, expenseByCat };
  }, [sales, purchases, other, period]);

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Profit &amp; Loss</h1>
        <p className="muted">Period {period.from} → {period.to}</p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <PeriodFilter value={period} onChange={setPeriod} />
            {/* Optional export button for later */}
            <Button variant="outline">Export CSV</Button>
          </div>

          <Separator />

          <section className="grid lg:grid-cols-3 gap-3">
            <div className="rounded-xl border p-3 bg-card">
              <div className="text-xs text-muted">Revenue</div>
              <div className="text-xl font-semibold">{formatGBP(calc.rev)}</div>
            </div>
            <div className="rounded-xl border p-3 bg-card">
              <div className="text-xs text-muted">COGS</div>
              <div className="text-xl font-semibold">{formatGBP(calc.cogs)}</div>
            </div>
            <div className="rounded-xl border p-3 bg-card">
              <div className="text-xs text-muted">Gross Profit</div>
              <div className="text-xl font-semibold">{formatGBP(calc.gross)}</div>
            </div>
          </section>

          <section className="grid lg:grid-cols-3 gap-3">
            <div className="rounded-xl border p-3 bg-card">
              <div className="text-xs text-muted">Operating Expenses</div>
              <div className="text-xl font-semibold">{formatGBP(calc.expenses)}</div>
              <div className="mt-2 text-xs">
                {Object.entries(calc.expenseByCat).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-muted">{k}</span>
                    <span>{formatGBP(v)}</span>
                  </div>
                ))}
                {Object.keys(calc.expenseByCat).length === 0 && (
                  <div className="text-muted">No expense lines in period.</div>
                )}
              </div>
            </div>
            <div className="rounded-xl border p-3 bg-card">
              <div className="text-xs text-muted">Operating Profit</div>
              <div className="text-xl font-semibold">{formatGBP(calc.operating)}</div>
            </div>
            <div className="rounded-xl border p-3 bg-card">
              <div className="text-xs text-muted">Other (net)</div>
              <div className="text-xl font-semibold">{formatGBP(calc.otherNet)}</div>
            </div>
          </section>

          <Separator />

          <div className="rounded-xl border p-4 bg-card">
            <div className="text-sm text-muted">Net Profit</div>
            <div className="text-2xl font-bold">{formatGBP(calc.net)}</div>
          </div>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/ship/business/oms/finance"
        nextHref="/ship/business/oms/finance/reports/balance-sheet"
        nextLabel="Balance Sheet"
      >
        Finance · Profit &amp; Loss
      </ArrowNav>
    </main>
  );
}