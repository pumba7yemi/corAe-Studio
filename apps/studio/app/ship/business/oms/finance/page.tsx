// apps/studio/app/ship/business/oms/finance/page.tsx
'use client';

/**
 * corAe — Finance Hub
 * - Date range filter (day/week/month/quarter/year/custom)
 * - Tiles deep-link with ?from=YYYY-MM-DD&to=YYYY-MM-DD&kind=*
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Card, CardContent } from '../../../../../../../src/components/ui/card';
import { Button } from '../../../../../../../src/components/ui/button';
import { Separator } from '../../../../../../../src/components/ui/separator';
import ArrowNav from '@/components/navigation/ArrowNav';

import PeriodFilter, {
  computeRange,
  type PeriodValue,
} from '../../../../../../../src/components/finance/PeriodFilter';

type LedgerSummary = {
  id: string;
  name: string;
  count: number;
  balance: number; // demo balance for now
  path: string;
};

export default function FinanceHubPage() {
  const router = useRouter();

  // Period (flat shape so consumers can read .from/.to)
  const [period, setPeriod] = useState<PeriodValue>(() => ({
    kind: 'month',
    ...computeRange('month'),
  }));

  const [ledgers, setLedgers] = useState<LedgerSummary[]>([]);

  useEffect(() => {
    // demo data — replace with /api/finance/summary?from=&to= later
    setLedgers([
      { id: 'sales',     name: 'Sales Invoices',     count: 12, balance: 18650.25, path: '/business/oms/finance/sales' },
      { id: 'purchases', name: 'Purchase Invoices',  count:  8, balance:  -9540.00, path: '/business/oms/finance/purchases' },
      { id: 'expenses',  name: 'Expenses',           count: 23, balance:  -2120.75, path: '/business/oms/finance/expenses' },
      { id: 'bank',      name: 'Bank Accounts',      count:  3, balance:   7300.00, path: '/business/oms/finance/bank' },
      { id: 'vat',       name: 'VAT Summary',        count:  1, balance:   -825.00, path: '/business/oms/finance/vat' },
    ]);
  }, []);

  const go = (l: LedgerSummary) => {
    const q = new URLSearchParams({
      from: period.from,
      to: period.to,
      kind: period.kind,
    }).toString();
    const url: string = l.path + '?' + q;
    // Next's router.push expects a RouteImpl type in this project setup; cast to unknown/any to satisfy TS
    router.push(url as unknown as any);
  };

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Finance Hub</h1>
        <p className="muted">Central overview of invoices, expenses, and balances.</p>
      </header>

      {/* Date range controls */}
      <section className="rounded-2xl border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <PeriodFilter value={period} onChange={setPeriod} />
          <div className="text-sm text-muted">
            Showing: <span className="font-mono">{period.from}</span> → <span className="font-mono">{period.to}</span>
          </div>
        </div>
      </section>

      {/* Tiles */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ledgers.map((l) => (
          <Card
            key={l.id}
            className="cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg"
            onClick={() => go(l)}
          >
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{l.name}</h2>
                <span
                  className={`text-sm font-medium ${
                    l.balance < 0 ? 'text-red-500' : 'text-emerald-400'
                  }`}
                >
                  {l.balance < 0 ? '-' : '+'}£{Math.abs(l.balance).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-slate-400">Entries: {l.count}</div>
              <div className="text-xs text-slate-500">
                Range: {period.from} → {period.to}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator />

      <ArrowNav
        backHref="/ship/business/oms"
        nextHref={`/ship/business/oms/finance/sales?from=${period.from}&to=${period.to}&kind=${period.kind}`}
        nextLabel="Sales Ledger"
      >
        Finance Module Entry Point
      </ArrowNav>
    </main>
  );
}