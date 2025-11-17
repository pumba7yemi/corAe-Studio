'use client';

/**
 * Finance — Bank Account Ledger
 * - Statement-style list with running balance & reconcile toggle (demo)
 * - Period + search; quick actions: Deposit / Withdrawal / Fee / Interest
 * - Shows POS settlements distinctly (to be fed by POS module next)
 * - Bottom arrows: back → Bank index, next → POS
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
// ✅ Long relative paths
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Separator } from '@/ui/separator';

import ArrowNav from '@/components/navigation/ArrowNav';
import PeriodFilter, {
  computeRange,
  type PeriodValue,
} from '@/components/finance/PeriodFilter';

type TxKind = 'deposit' | 'withdrawal' | 'transfer-in' | 'transfer-out' | 'fee' | 'interest' | 'pos-settle';

type BankTx = {
  id: string;
  date_iso: string;
  kind: TxKind;
  ref?: string;
  payee?: string;
  amount_minor: number; // positive; sign is derived from kind
  reconciled?: boolean;
};

const money = (m: number) => `£${(m / 100).toFixed(2)}`;

export default function BankAccountPage() {
  const params = useParams<{ id: string }>() ?? { id: '' };
  const accId = decodeURIComponent(params.id ?? '');

  const [name, setName] = useState<string>('');          // account name
  const [opening, setOpening] = useState<number>(0);     // opening minor (demo)
  const [txs, setTxs] = useState<BankTx[]>([]);
  const [q, setQ] = useState('');

  const [period, setPeriod] = useState<PeriodValue>(() => computeRange('month'));

  useEffect(() => {
    // In a real app, fetch by accId
    setName(
      accId === 'BANK-001' ? 'HSBC Current' :
      accId === 'BANK-002' ? 'Barclaycard' :
      accId === 'BANK-003' ? 'Cash Till' :
      accId === 'BANK-004' ? 'Stripe Merchant' :
      accId
    );
    setOpening(accId === 'BANK-002' ? -54000 : accId === 'BANK-001' ? 250000 : accId === 'BANK-003' ? 15000 : 0);

    // Demo transactions subset
    const demo: Record<string, BankTx[]> = {
      'BANK-001': [
        { id: 'TX-001', date_iso: '2025-03-02', kind: 'deposit',    payee: 'Client receipt', amount_minor: 171000, reconciled: true },
        { id: 'TX-002', date_iso: '2025-03-05', kind: 'withdrawal', payee: 'Supplier payment', amount_minor: 60000, reconciled: true },
        { id: 'TX-003', date_iso: '2025-03-15', kind: 'fee',        payee: 'Bank fee', amount_minor: 1200 },
        { id: 'TX-004', date_iso: '2025-03-20', kind: 'deposit',    payee: 'Client receipt', amount_minor: 50000 },
      ],
      'BANK-002': [
        { id: 'TX-101', date_iso: '2025-03-04', kind: 'withdrawal', payee: 'Fuel', amount_minor: 7800 },
        { id: 'TX-102', date_iso: '2025-03-18', kind: 'withdrawal', payee: 'Supplies', amount_minor: 12900 },
      ],
      'BANK-003': [
        { id: 'TX-201', date_iso: '2025-03-01', kind: 'deposit',    payee: 'Opening float top-up', amount_minor: 5000 },
        { id: 'TX-202', date_iso: '2025-03-31', kind: 'withdrawal', payee: 'Banking cash', amount_minor: 8000 },
      ],
      'BANK-004': [
        { id: 'TX-301', date_iso: '2025-03-07', kind: 'pos-settle', payee: 'Stripe payout', amount_minor: 42200, reconciled: true },
        { id: 'TX-302', date_iso: '2025-03-28', kind: 'pos-settle', payee: 'Stripe payout', amount_minor: 61500 },
      ],
    };
    setTxs(demo[accId] ?? []);
  }, [accId]);

  const sign = (k: TxKind) => (k === 'deposit' || k === 'transfer-in' || k === 'interest' || k === 'pos-settle' ? 1 : -1);

  const inPeriod = useMemo(() => {
    const fromTs = new Date(period.from).getTime();
    const toTs = new Date(period.to).getTime();
    const term = q.trim().toLowerCase();

    return txs
      .filter((t) => {
        const ts = new Date(t.date_iso).getTime();
        const within = ts >= fromTs && ts <= toTs;
        const hit = !term || [t.id, t.payee ?? '', t.ref ?? '', t.kind].join(' ').toLowerCase().includes(term);
        return within && hit;
      })
      .sort((a, b) => a.date_iso.localeCompare(b.date_iso) || a.id.localeCompare(b.id));
  }, [txs, period, q]);

  const computed = useMemo(() => {
    let running = opening;
    const lines = inPeriod.map((t) => {
      running += sign(t.kind) * t.amount_minor;
      return { ...t, signed_minor: sign(t.kind) * t.amount_minor, running_minor: running };
    });

    const inflow  = lines.filter(l => l.signed_minor > 0).reduce((a, l) => a + l.signed_minor, 0);
    const outflow = lines.filter(l => l.signed_minor < 0).reduce((a, l) => a + Math.abs(l.signed_minor), 0);
    const posSettlements = lines.filter(l => l.kind === 'pos-settle').reduce((a, l) => a + l.signed_minor, 0);

    return { lines, inflow, outflow, posSettlements, end_minor: running };
  }, [inPeriod, opening]);

  // Quick actions (demo)
  function addTx(kind: TxKind) {
    const today = new Date().toISOString().slice(0, 10);
    const amt = kind === 'fee' ? 1200 : kind === 'interest' ? 500 : 10000;
    setTxs((cur) => [
      ...cur,
      {
        id: `${kind}-${Math.random().toString(36).slice(2, 6)}`,
        date_iso: today,
        kind,
        payee:
          kind === 'deposit' ? 'Manual deposit' :
          kind === 'withdrawal' ? 'Manual withdrawal' :
          kind === 'fee' ? 'Bank fee' :
          kind === 'interest' ? 'Interest' :
          kind === 'pos-settle' ? 'POS settlement' :
          'Transfer',
        amount_minor: amt,
      },
    ]);
  }

  function toggleReconciled(id: string) {
    setTxs((cur) => cur.map((t) => (t.id === id ? { ...t, reconciled: !t.reconciled } : t)));
  }

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Bank · {name}</h1>
        <p className="muted">
          Account ID: {accId} • Opening balance: {money(opening)} • Period {period.from} → {period.to}
        </p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="row">
              <Input value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} placeholder="Search ref/payee…" />
            </div>
            <div className="row">
              <Button variant="outline" onClick={() => addTx('deposit')}>Deposit</Button>
              <Button variant="outline" onClick={() => addTx('withdrawal')}>Withdrawal</Button>
              <Button variant="outline" onClick={() => addTx('fee')}>Fee</Button>
              <Button variant="outline" onClick={() => addTx('interest')}>Interest</Button>
              <Button onClick={() => addTx('pos-settle')}>+ POS Settlement</Button>
            </div>
          </div>

          {/* Period */}
          <div className="mt-2">
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <Separator />

          {/* Totals */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <Stat label="Inflow" value={money(computed.inflow)} />
            <Stat label="Outflow" value={money(computed.outflow)} />
            <Stat label="POS Settled" value={money(computed.posSettlements)} />
            <Stat label="Ending Balance" value={money(computed.end_minor)} />
          </div>

          <Separator />

          {/* Statement lines */}
          <div className="grid gap-2">
            {computed.lines.map((l) => (
              <div key={l.id} className="rounded-xl border p-3 bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono font-semibold">{l.id}</div>
                    <div className="text-xs text-muted">
                      {l.date_iso} • {l.kind.toUpperCase()}
                      {l.payee ? ` • ${l.payee}` : ''}{l.ref ? ` • Ref ${l.ref}` : ''}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className={l.signed_minor >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {l.signed_minor >= 0 ? '+' : '-'}{money(Math.abs(l.signed_minor))}
                    </div>
                    <div className="text-xs text-muted">Balance → {money(l.running_minor)}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs">
                    <span className={[
                      'px-2 py-0.5 rounded-full border',
                      l.reconciled ? 'text-emerald-400 border-emerald-600/40' : 'text-slate-300 border-slate-600/40',
                    ].join(' ')}>
                      {l.reconciled ? 'RECONCILED' : 'UNRECONCILED'}
                    </span>
                    {l.kind === 'pos-settle' && (
                      <span className="ml-2 px-2 py-0.5 rounded-full border text-xs text-sky-300 border-sky-600/40">
                        POS
                      </span>
                    )}
                  </div>
                  <div className="row">
                    <Button variant="outline" onClick={() => toggleReconciled(l.id)}>
                      {l.reconciled ? 'Unreconcile' : 'Reconcile'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {computed.lines.length === 0 && (
              <div className="text-sm text-muted">No transactions in this period.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/ship/business/oms/finance/bank"
        nextHref="/ship/business/oms/finance/pos"
        nextLabel="POS"
      >
        Finance · Bank Ledger
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