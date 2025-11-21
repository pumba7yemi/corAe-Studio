// apps/studio/app/ship/business/oms/finance/bank/page.tsx
'use client';

/**
 * Finance — Bank Accounts
 * - Multi-account balances + transaction list
 * - Period filter (day/week/month/quarter/year/custom)
 * - Per-account filter, search, simple "Reconcile" toggle (demo only)
 * - Bottom arrows: back → Finance Hub, next → P&L
 */

import React, { useEffect, useMemo, useState } from 'react';

// Local lightweight UI components to avoid missing module errors in this demo
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={["rounded-xl border p-3 bg-card", className].filter(Boolean).join(' ')}>{children}</div>
);
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);
const Button = ({ children, onClick, variant, className }: { children: React.ReactNode; onClick?: () => void; variant?: string; className?: string }) => (
  <button onClick={onClick} className={["px-3 py-1 rounded", variant === 'outline' ? 'border' : '', className].filter(Boolean).join(' ')}>
    {children}
  </button>
);
const Input = ({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) => (
  <input value={value} onChange={onChange} placeholder={placeholder} className="rounded-md border px-3 py-2 bg-transparent" />
);
const Separator = () => <hr className="my-2 border-t" />;

import ArrowNav from '@/components/navigation/ArrowNav';
import PeriodFilter, { computeRange, type PeriodValue }  from '@/components/finance/PeriodFilter';

type Money = number;

type BankAccount = {
  id: string;
  name: string;
  iban?: string;
  sort_code?: string;
  number?: string;
  currency: 'GBP';
  opening_minor: Money;
};

type BankTxn = {
  id: string;
  date_iso: string;
  account_id: string;
  type: 'in' | 'out';
  source?: 'POS' | 'Supplier' | 'Customer' | 'Bank Fee' | 'Transfer';
  ref?: string;
  description: string;
  amount_minor: Money;
  reconciled?: boolean;
};

const fmtGBP = (m: number) => `£${(m / 100).toFixed(2)}`;

export default function BankAccountsPage() {
  const [period, setPeriod] = useState<PeriodValue>(() => computeRange('month'));

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [txns, setTxns] = useState<BankTxn[]>([]);

  const [accountId, setAccountId] = useState<'all' | string>('all');
  const [q, setQ] = useState('');
  const [showReconciled, setShowReconciled] = useState<'all' | 'only' | 'unrec'>('all');

  useEffect(() => {
    const demoAccounts: BankAccount[] = [
      { id: 'ACC-HSBC-001', name: 'HSBC Current', sort_code: '40-11-60', number: '12345678', currency: 'GBP', opening_minor: 250000 },
      { id: 'ACC-TILL-CP', name: 'Cash Till — Choice Plus', currency: 'GBP', opening_minor: 31500 },
      { id: 'ACC-STRIPE', name: 'Stripe Payouts', currency: 'GBP', opening_minor: 120000 },
    ];

    const demoTx: BankTxn[] = [
      { id: 'TX-1001', date_iso: '2025-03-01', account_id: 'ACC-STRIPE', type: 'in',  source: 'POS',      ref: 'STRP/0301/A',     description: 'Card takings (net) — Glam & Glow', amount_minor: 23443, reconciled: true },
      { id: 'TX-1002', date_iso: '2025-03-02', account_id: 'ACC-STRIPE', type: 'out', source: 'Transfer', ref: 'STRP-PAYOUT-0302', description: 'Stripe payout to HSBC',              amount_minor: 23000, reconciled: true },
      { id: 'TX-1003', date_iso: '2025-03-03', account_id: 'ACC-HSBC-001', type: 'in', source: 'Transfer', ref: 'STRP-PAYOUT-0302', description: 'Stripe payout received',            amount_minor: 23000, reconciled: true },
      { id: 'TX-1010', date_iso: '2025-03-01', account_id: 'ACC-TILL-CP', type: 'in',  source: 'POS',      ref: 'TILL/CP/0301',     description: 'Cash takings — Choice Plus',        amount_minor: 18400, reconciled: false },
      { id: 'TX-1020', date_iso: '2025-03-12', account_id: 'ACC-HSBC-001', type: 'out', source: 'Supplier', ref: 'BILL-2002',         description: 'Fresh Farms Wholesale',            amount_minor: 20000, reconciled: false },
      { id: 'TX-1025', date_iso: '2025-03-13', account_id: 'ACC-HSBC-001', type: 'out', source: 'Bank Fee', ref: 'HSBC/FEES/MAR',     description: 'Monthly account charges',          amount_minor: 900,   reconciled: false },
    ];

    setAccounts(demoAccounts);
    setTxns(demoTx);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const fromTs = new Date(period.from).getTime();
    const toTs = new Date(period.to).getTime();

    return txns.filter((t) => {
      const ts = new Date(t.date_iso).getTime();
      if (ts < fromTs || ts > toTs) return false;
      if (accountId !== 'all' && t.account_id !== accountId) return false;
      if (showReconciled === 'only' && !t.reconciled) return false;
      if (showReconciled === 'unrec' && t.reconciled) return false;
      if (!term) return true;
      return [t.id, t.ref ?? '', t.description, t.source ?? ''].join(' ').toLowerCase().includes(term);
    });
  }, [txns, q, accountId, showReconciled, period]);

  const balances = useMemo(() => {
    const map = new Map<string, { opening: number; in: number; out: number; closing: number }>();
    accounts.forEach((a) => map.set(a.id, { opening: a.opening_minor, in: 0, out: 0, closing: a.opening_minor }));
    filtered.forEach((t) => {
      const row = map.get(t.account_id);
      if (!row) return;
      if (t.type === 'in') row.in += t.amount_minor;
      else row.out += t.amount_minor;
      row.closing = row.opening + row.in - row.out;
      map.set(t.account_id, row);
    });
    return map;
  }, [accounts, filtered]);

  function toggleReconcile(id: string) {
    setTxns((list) => list.map((t) => (t.id === id ? { ...t, reconciled: !t.reconciled } : t)));
  }

  function importPosCashToHSBC() {
    const till = accounts.find((a) => a.id === 'ACC-TILL-CP');
    const hsbc = accounts.find((a) => a.id === 'ACC-HSBC-001');
    if (!till || !hsbc) return;
    const unrecTill = filtered.filter((t) => t.account_id === till.id && t.type === 'in' && !t.reconciled);
    if (!unrecTill.length) {
      alert('No unposted till cash in current filters.');
      return;
    }
    const total = unrecTill.reduce((a, t) => a + t.amount_minor, 0);
    const today = new Date().toISOString().slice(0, 10);
    const newIdOut = `TX-MOVE-${Date.now()}-OUT`;
    const newIdIn = `TX-MOVE-${Date.now()}-IN`;
    setTxns((list) => [
      ...list,
      { id: newIdOut, date_iso: today, account_id: till.id, type: 'out', source: 'Transfer', ref: 'BANK/DEPOSIT', description: 'Till deposit to HSBC', amount_minor: total, reconciled: true },
      { id: newIdIn,  date_iso: today, account_id: hsbc.id, type: 'in',  source: 'Transfer', ref: 'BANK/DEPOSIT', description: 'Till deposit received', amount_minor: total, reconciled: false },
    ]);
    alert(`Created transfer £${(total / 100).toFixed(2)} from Till → HSBC (demo).`);
  }

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Bank Accounts</h1>
        <p className="muted">Balances and transactions across all accounts.</p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, description…" />
              <select value={accountId} onChange={(e) => setAccountId(e.target.value as any)} className="rounded-md border px-3 py-2 bg-transparent">
                <option value="all">All accounts</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <select value={showReconciled} onChange={(e) => setShowReconciled(e.target.value as any)} className="rounded-md border px-3 py-2 bg-transparent">
                <option value="all">All</option>
                <option value="only">Reconciled only</option>
                <option value="unrec">Unreconciled only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={importPosCashToHSBC}>Move Till Cash → HSBC (demo)</Button>
            </div>
          </div>

          <div className="mt-1">
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((a) => {
              const b = balances.get(a.id) ?? { opening: a.opening_minor, in: 0, out: 0, closing: a.opening_minor };
              return (
                <div key={a.id} className="rounded-xl border p-3 bg-card">
                  <div className="text-sm font-semibold">{a.name}</div>
                  <div className="text-xs text-muted">Opening {fmtGBP(b.opening)} • In {fmtGBP(b.in)} • Out {fmtGBP(b.out)}</div>
                  <div className="mt-1 text-base">Closing: <span className="font-semibold">{fmtGBP(b.closing)}</span></div>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="grid gap-2">
            {filtered.map((t) => (
              <div key={t.id} className="rounded-xl border p-3 bg-card">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="font-mono text-sm">{t.id}</div>
                    <div className="text-xs text-muted">
                      {t.date_iso} • {accounts.find((a) => a.id === t.account_id)?.name ?? t.account_id}
                      {t.ref ? ` • Ref ${t.ref}` : ''} {t.source ? ` • ${t.source}` : ''}
                    </div>
                    <div className="text-sm">{t.description}</div>
                  </div>
                  <div className="text-right">
                    <div className={['text-base font-semibold', t.type === 'in' ? 'text-emerald-400' : 'text-red-300'].join(' ')}>
                      {t.type === 'in' ? '+' : '−'}
                      {fmtGBP(t.amount_minor)}
                    </div>
                    <div className="text-xs">
                      <span className={['px-2 py-0.5 rounded-full border', t.reconciled ? 'text-emerald-400 border-emerald-600/40' : 'text-slate-300 border-slate-600/40'].join(' ')}>
                        {t.reconciled ? 'RECONCILED' : 'UNRECONCILED'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => toggleReconcile(t.id)}>
                    {t.reconciled ? 'Unreconcile' : 'Reconcile'}
                  </Button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && <div className="text-sm text-muted">No transactions match your filters.</div>}
          </div>
        </CardContent>
      </Card>

      <ArrowNav backHref="/ship/business/oms/finance" nextHref="/ship/business/oms/finance/pnl" nextLabel="Profit & Loss">
        Finance · Bank
      </ArrowNav>
    </main>
  );
}