'use client';

/**
 * Finance — Expenses (OPEX / Staff Reimbursements)
 * - Lists expense claims & vendor expenses with quick filters & totals
 * - Uses PeriodFilter that returns flat { kind, from, to }
 * - Bottom arrows: back → Finance Hub, next → Bank/Cashbook
 */

import React, { useEffect, useMemo, useState } from 'react';

// ✅ Use the long relative path you confirmed works
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Separator } from '@/ui/separator';

import ArrowNav from '@/components/navigation/ArrowNav';
import PeriodFilter, {
  computeRange,
  type PeriodValue,
} from '../../../../../../../../src/components/finance/PeriodFilter';

type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'reimbursed' | 'posted';
type ExpenseKind =
  | 'travel'
  | 'fuel'
  | 'meals'
  | 'supplies'
  | 'maintenance'
  | 'utilities'
  | 'software'
  | 'other';

type ExpenseRow = {
  id: string;             // e.g., EXP-3001
  date_iso: string;       // expense date
  claimant: string;       // employee or dept
  supplier?: string;      // optional (if vendor expense)
  description: string;
  kind: ExpenseKind;
  net_minor: number;      // in minor units
  vat_minor: number;
  paid_minor: number;     // reimbursements/paid out
  status: ExpenseStatus;
  ref?: string;           // optional ref (PO/Trip etc.)
};

const money = (m: number) => `£${(m / 100).toFixed(2)}`;

export default function ExpensesLedgerPage() {
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | ExpenseStatus>('all');
  const [kind, setKind] = useState<'all' | ExpenseKind>('all');

  // ✅ Flat default so period.from / period.to are always defined
  const [period, setPeriod] = useState<PeriodValue>(() => computeRange('month'));

  // Seed demo data
  useEffect(() => {
    const demo: ExpenseRow[] = [
      {
        id: 'EXP-3001',
        date_iso: '2025-03-03',
        claimant: 'A. Patel',
        supplier: 'City Cabs',
        description: 'Client site visit – taxi',
        kind: 'travel',
        net_minor: 2800,
        vat_minor: 560,
        paid_minor: 3360,
        status: 'reimbursed',
        ref: 'TRIP-554',
      },
      {
        id: 'EXP-3002',
        date_iso: '2025-03-11',
        claimant: 'J. Smith',
        supplier: 'BP Service Station',
        description: 'Fuel – delivery van',
        kind: 'fuel',
        net_minor: 7200,
        vat_minor: 1440,
        paid_minor: 0,
        status: 'approved',
        ref: 'VAN-02',
      },
      {
        id: 'EXP-3003',
        date_iso: '2025-03-19',
        claimant: 'Operations',
        supplier: 'ToolTown',
        description: 'Warehouse supplies',
        kind: 'supplies',
        net_minor: 12900,
        vat_minor: 2580,
        paid_minor: 0,
        status: 'posted',
        ref: 'PO-9921',
      },
      {
        id: 'EXP-3004',
        date_iso: '2025-02-22',
        claimant: 'Facilities',
        supplier: 'VS Maintenance Services',
        description: 'Roller door service',
        kind: 'maintenance',
        net_minor: 48000,
        vat_minor: 9600,
        paid_minor: 0,
        status: 'submitted',
        ref: 'WO-441',
      },
      {
        id: 'EXP-3005',
        date_iso: '2025-03-31',
        claimant: 'Finance',
        supplier: 'SaaS Co.',
        description: 'Accounting software – monthly',
        kind: 'software',
        net_minor: 2500,
        vat_minor: 500,
        paid_minor: 0,
        status: 'draft',
        ref: 'SUB-ACC-03',
      },
    ];
    setRows(demo);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const fromTs = new Date(period.from).getTime();
    const toTs = new Date(period.to).getTime();

    return rows.filter((r) => {
      const ts = new Date(r.date_iso).getTime();
      const inRange = ts >= fromTs && ts <= toTs;
      const okStatus = status === 'all' ? true : r.status === status;
      const okKind = kind === 'all' ? true : r.kind === kind;
      const okTerm =
        !term ||
        [
          r.id,
          r.claimant,
          r.supplier ?? '',
          r.description,
          r.kind,
          r.status,
          r.ref ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(term);

      return inRange && okStatus && okKind && okTerm;
    });
  }, [rows, q, status, kind, period]);

  const totals = useMemo(() => {
    const net = filtered.reduce((a, r) => a + r.net_minor, 0);
    const vat = filtered.reduce((a, r) => a + r.vat_minor, 0);
    const gross = net + vat;
    const paid = filtered.reduce((a, r) => a + r.paid_minor, 0);
    const due = Math.max(0, gross - paid);
    return { net, vat, gross, paid, due };
  }, [filtered]);

  function createExpense() {
    const n = rows.length + 3001;
    const today = new Date().toISOString().slice(0, 10);
    setRows([
      {
        id: `EXP-${n}`,
        date_iso: today,
        claimant: 'New Claimant',
        supplier: 'New Supplier',
        description: 'New expense',
        kind: 'other',
        net_minor: 1000,
        vat_minor: 200,
        paid_minor: 0,
        status: 'draft',
        ref: 'NEW',
      },
      ...rows,
    ]);
  }

  function submit(id: string) {
    setRows((list) =>
      list.map((r) => (r.id === id ? { ...r, status: 'submitted' } : r))
    );
  }
  function approve(id: string) {
    setRows((list) =>
      list.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );
  }
  function reimburse(id: string) {
    setRows((list) =>
      list.map((r) =>
        r.id === id
          ? { ...r, status: 'reimbursed', paid_minor: r.net_minor + r.vat_minor }
          : r
      )
    );
  }
  function post(id: string) {
    setRows((list) =>
      list.map((r) => (r.id === id ? { ...r, status: 'posted' } : r))
    );
  }

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="muted">Operating expenses & staff reimbursements (demo data).</p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input
                value={q}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
                placeholder="Search id, claimant, supplier, description…"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="rounded-md border px-3 py-2 bg-transparent"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="reimbursed">Reimbursed</option>
                <option value="posted">Posted</option>
              </select>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as any)}
                className="rounded-md border px-3 py-2 bg-transparent"
              >
                <option value="all">All types</option>
                <option value="travel">Travel</option>
                <option value="fuel">Fuel</option>
                <option value="meals">Meals</option>
                <option value="supplies">Supplies</option>
                <option value="maintenance">Maintenance</option>
                <option value="utilities">Utilities</option>
                <option value="software">Software</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Button onClick={createExpense}>+ New Expense</Button>
          </div>

          {/* Period Filter */}
          <div className="mt-2">
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <Separator />

          {/* List */}
          <div className="grid gap-3">
            {filtered.map((r) => {
              const gross = r.net_minor + r.vat_minor;
              const outstanding = Math.max(0, gross - r.paid_minor);
              const chip =
                r.status === 'reimbursed'
                  ? 'text-emerald-400 border-emerald-600/40'
                  : r.status === 'approved'
                  ? 'text-sky-300 border-sky-600/40'
                  : r.status === 'submitted'
                  ? 'text-amber-300 border-amber-600/40'
                  : r.status === 'posted'
                  ? 'text-slate-300 border-slate-600/40'
                  : 'text-slate-400 border-slate-600/40';

              return (
                <div key={r.id} className="rounded-xl border p-3 bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-mono font-semibold">{r.id}</div>
                      <div className="text-xs text-muted">
                        {r.date_iso} • {r.claimant}
                        {r.supplier ? ` • ${r.supplier}` : ''} • {r.kind.toUpperCase()}
                        {r.ref ? ` • Ref ${r.ref}` : ''}
                      </div>
                      <div className="text-sm mt-1">{r.description}</div>
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
                      <span className={`px-2 py-0.5 rounded-full border ${chip}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {r.status === 'draft' && (
                        <Button variant="outline" onClick={() => submit(r.id)}>
                          Submit
                        </Button>
                      )}
                      {r.status === 'submitted' && (
                        <Button variant="outline" onClick={() => approve(r.id)}>
                          Approve
                        </Button>
                      )}
                      {r.status === 'approved' && (
                        <Button variant="default" onClick={() => reimburse(r.id)}>
                          Reimburse
                        </Button>
                      )}
                      {r.status !== 'posted' && (
                        <Button variant="outline" onClick={() => post(r.id)}>
                          Post
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-sm text-muted">No expenses match your filters.</div>
            )}
          </div>

          <Separator />

          {/* Totals */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
            <Stat label="Net" value={money(totals.net)} />
            <Stat label="VAT" value={money(totals.vat)} />
            <Stat label="Gross" value={money(totals.gross)} />
            <Stat label="Paid/Reimbursed" value={money(totals.paid)} />
            <Stat label="Outstanding" value={money(totals.due)} />
          </div>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/ship/business/oms/finance"
        nextHref="/ship/business/oms/finance/bank"
        nextLabel="Bank / Cashbook"
      >
        Finance · Expenses
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