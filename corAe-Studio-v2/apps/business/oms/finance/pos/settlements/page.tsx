// apps/studio/app/business/oms/finance/pos/settlements/page.tsx
'use client';

/**
 * Finance â€” POS Settlements
 * - Lists daily POS settlement batches (cash & card) in a period
 * - Batch-level â€œPost to Bankâ€ actions (demo only)
 * - Bottom arrows: back â†’ Finance Hub, next â†’ Bank Accounts
 */

import React, { useEffect, useMemo, useState } from 'react';

// âœ… Use the long relative imports that work in your workspace
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Separator } from '@/ui/separator';
import ArrowNav from '@/components/navigation/ArrowNav';

import PeriodFilter, {
  computeRange,
  type PeriodValue,
} from '@/components/finance/PeriodFilter';

type Money = number;

type Settlement = {
  id: string;               // e.g., SET-20250310-CARD
  date_iso: string;         // business day
  location: string;         // store / site
  method: 'cash' | 'card';  // settlement method
  gross_minor: Money;       // POS takings excl fees
  fees_minor?: Money;       // card fees
  net_minor: Money;         // amount to bank/cash
  batch_ref?: string;       // acquirer batch ref
  posted?: boolean;         // demo: whether posted to bank
  posted_bank_acc?: string; // which bank account
};

const formatGBP = (m: number) => `Â£${(m / 100).toFixed(2)}`;

export default function PosSettlementsPage() {
  // Flat period so period.from & period.to always exist
  const [period, setPeriod] = useState<PeriodValue>(() => computeRange('month'));
  const [q, setQ] = useState('');
  const [method, setMethod] = useState<'all' | 'cash' | 'card'>('all');
  const [rows, setRows] = useState<Settlement[]>([]);

  useEffect(() => {
    // Demo data; replace with API pull later
    const demo: Settlement[] = [
      {
        id: 'SET-20250301-CARD',
        date_iso: '2025-03-01',
        location: 'Choice Plus Supermarket',
        method: 'card',
        gross_minor: 61500,
        fees_minor: 925,
        net_minor: 60575,
        batch_ref: 'STRP/0301/A',
      },
      {
        id: 'SET-20250301-CASH',
        date_iso: '2025-03-01',
        location: 'Choice Plus Supermarket',
        method: 'cash',
        gross_minor: 18400,
        net_minor: 18400,
        batch_ref: 'TILL/CP/0301',
      },
      {
        id: 'SET-20250310-CARD',
        date_iso: '2025-03-10',
        location: 'Al Amba Restaurant',
        method: 'card',
        gross_minor: 42200,
        fees_minor: 633,
        net_minor: 41567,
        batch_ref: 'STRP/0310/B',
      },
      {
        id: 'SET-20250328-CARD',
        date_iso: '2025-03-28',
        location: 'Glam & Glow Salon',
        method: 'card',
        gross_minor: 23800,
        fees_minor: 357,
        net_minor: 23443,
        batch_ref: 'STRP/0328/C',
      },
      {
        id: 'SET-20250331-CASH',
        date_iso: '2025-03-31',
        location: 'Grace & Grit Gym',
        method: 'cash',
        gross_minor: 9100,
        net_minor: 9100,
        batch_ref: 'TILL/GG/0331',
      },
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
      const okMethod = method === 'all' ? true : r.method === method;
      const okTerm =
        !term ||
        [r.id, r.location, r.method, r.batch_ref ?? ''].join(' ').toLowerCase().includes(term);
      return inRange && okMethod && okTerm;
    });
  }, [rows, q, method, period]);

  const totals = useMemo(() => {
    const gross = filtered.reduce((a, s) => a + s.gross_minor, 0);
    const fees  = filtered.reduce((a, s) => a + (s.fees_minor ?? 0), 0);
    const net   = filtered.reduce((a, s) => a + s.net_minor, 0);
    return { gross, fees, net };
  }, [filtered]);

  function postBatch(id: string, bankAcc: string) {
    // Demo-only: mark as posted; in real flow, call API to create bank tx
    setRows(list =>
      list.map((s) => (s.id === id ? { ...s, posted: true, posted_bank_acc: bankAcc } : s))
    );
    alert(`Posted ${id} to ${bankAcc} (demo)`);
  }

  function postAllVisible(toAcc: string) {
    const ids = filtered.filter(s => !s.posted).map(s => s.id);
    if (!ids.length) return alert('Nothing to post.');
    setRows(list =>
      list.map((s) =>
        ids.includes(s.id) ? { ...s, posted: true, posted_bank_acc: toAcc } : s
      )
    );
    alert(`Posted ${ids.length} batch(es) to ${toAcc} (demo)`);
  }

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">POS Settlements</h1>
        <p className="muted">Daily cash & card settlements flowing into Bank.</p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search id, location, refâ€¦" />
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="rounded-md border px-3 py-2 bg-transparent"
              >
                <option value="all">All methods</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => postAllVisible('HSBC Current')}>
                Post Visible â†’ HSBC Current
              </Button>
              <Button variant="outline" onClick={() => postAllVisible('Cash Till')}>
                Post Visible â†’ Cash Till
              </Button>
            </div>
          </div>

          {/* Period */}
          <div className="mt-1">
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <Separator />

          {/* List */}
          <div className="grid gap-3">
            {filtered.map((s) => (
              <div key={s.id} className="rounded-xl border p-3 bg-card">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <div className="font-mono font-semibold">{s.id}</div>
                    <div className="text-xs text-muted">
                      {s.location} â€¢ {s.method.toUpperCase()} â€¢ {s.date_iso}
                      {s.batch_ref ? ` â€¢ Batch ${s.batch_ref}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      Net: <span className="font-medium">{formatGBP(s.net_minor)}</span>
                    </div>
                    <div className="text-xs text-muted">
                      Gross {formatGBP(s.gross_minor)}
                      {s.fees_minor ? ` â€¢ Fees ${formatGBP(s.fees_minor)}` : ''}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs">
                    <span
                      className={[
                        'px-2 py-0.5 rounded-full border',
                        s.posted
                          ? 'text-emerald-400 border-emerald-600/40'
                          : 'text-slate-300 border-slate-600/40',
                      ].join(' ')}
                    >
                      {s.posted ? `POSTED â†’ ${s.posted_bank_acc}` : 'UNPOSTED'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!s.posted && (
                      <>
                        <Button variant="outline" onClick={() => postBatch(s.id, 'HSBC Current')}>
                          Post â†’ HSBC Current
                        </Button>
                        <Button variant="outline" onClick={() => postBatch(s.id, 'Cash Till')}>
                          Post â†’ Cash Till
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-sm text-muted">No settlements match your filters.</div>
            )}
          </div>

          <Separator />

          {/* Totals */}
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <Stat label="Gross" value={formatGBP(totals.gross)} />
            <Stat label="Fees" value={formatGBP(totals.fees)} />
            <Stat label="Net" value={formatGBP(totals.net)} />
          </div>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/business/oms/finance"
        nextHref="/business/oms/finance/bank"
        nextLabel="Bank Accounts"
      >
        Finance Â· POS Settlements
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
