'use client';

/**
 * Finance — Balance Sheet
 * - Snapshot at end of period (demo calc)
 * - Assets: Bank/Cash, Accounts Receivable, Inventory
 * - Liabilities: Accounts Payable, VAT Control (net)
 * - Equity: Retained Earnings (Assets - Liabilities)
 * - Bottom arrows: back → P&L, next → Finance Hub
 */

import React, { useEffect, useMemo, useState } from 'react';

// One level deeper → extra "../"
import { Card, CardContent } from '../../../../../../../../../src/components/ui/card';
import { Separator } from '../../../../../../../../../src/components/ui/separator';
import ArrowNav from '@/components/navigation/ArrowNav';

import PeriodFilter, {
  computeRange,
  type PeriodValue,
} from '../../../../../../../../../src/components/finance/PeriodFilter';

type Money = number;
const formatGBP = (m: number) => `£${(m / 100).toFixed(2)}`;

type BankAcc = { id: string; name: string; opening_minor: Money; };
type BankTx = { acc_id: string; date_iso: string; kind: 'deposit'|'withdrawal'|'fee'|'interest'|'pos-settle'|'transfer-in'|'transfer-out'; amount_minor: Money; };

type AR = { date_iso: string; net_minor: Money; vat_minor: Money; paid_minor: Money; }; // sales invs
type AP = { date_iso: string; net_minor: Money; vat_minor: Money; paid_minor: Money; }; // purchase bills

export default function BalanceSheetPage() {
  const [period, setPeriod] = useState<PeriodValue>(() => ({
    kind: 'month',
    ...computeRange('month'),
  }));

  // Demo data (very small set)
  const [accounts, setAccounts] = useState<BankAcc[]>([]);
  const [txs, setTxs] = useState<BankTx[]>([]);
  const [ar, setAR] = useState<AR[]>([]);
  const [ap, setAP] = useState<AP[]>([]);
  const [inventoryMinor, setInventoryMinor] = useState<Money>(95000); // demo static

  useEffect(() => {
    setAccounts([
      { id: 'BANK-001', name: 'HSBC Current',   opening_minor: 250000 },
      { id: 'BANK-003', name: 'Cash Till',      opening_minor:  15000 },
      { id: 'BANK-004', name: 'Stripe Merchant',opening_minor:      0 },
    ]);
    setTxs([
      { acc_id: 'BANK-001', date_iso: '2025-03-02', kind: 'deposit',    amount_minor: 171000 },
      { acc_id: 'BANK-001', date_iso: '2025-03-05', kind: 'withdrawal', amount_minor:  60000 },
      { acc_id: 'BANK-001', date_iso: '2025-03-15', kind: 'fee',        amount_minor:   1200 },
      { acc_id: 'BANK-003', date_iso: '2025-03-31', kind: 'withdrawal', amount_minor:   8000 },
      { acc_id: 'BANK-004', date_iso: '2025-03-28', kind: 'pos-settle', amount_minor:  61500 },
    ]);
    setAR([
      { date_iso: '2025-03-10', net_minor: 86500,  vat_minor: 17300, paid_minor: 60000 }, // part paid
      { date_iso: '2025-03-28', net_minor: 45500,  vat_minor:  9100, paid_minor:     0 }, // unpaid
    ]);
    setAP([
      { date_iso: '2025-03-12', net_minor: 48600,  vat_minor:  9720, paid_minor: 20000 }, // part paid
      { date_iso: '2025-03-27', net_minor: 33100,  vat_minor:  6620, paid_minor:     0 }, // unpaid
    ]);
  }, []);

  const inRange = (iso: string) => {
    const t = new Date(iso).getTime();
    return t >= new Date(period.from).getTime() && t <= new Date(period.to).getTime();
  };

  const sign = (k: BankTx['kind']) =>
    k === 'deposit' || k === 'interest' || k === 'pos-settle' || k === 'transfer-in' ? 1 : -1;

  const calc = useMemo(() => {
    // Bank balances (very simplified: opening + in-period movement)
    const banks = accounts.map(a => {
      const movement = txs
        .filter(t => t.acc_id === a.id && inRange(t.date_iso))
        .reduce((s, t) => s + sign(t.kind) * t.amount_minor, 0);
      return { name: a.name, balance: a.opening_minor + movement };
    });
    const bankTotal = banks.reduce((s, b) => s + b.balance, 0);

    // AR outstanding (gross)
    const arOutstanding =
      ar.filter(i => inRange(i.date_iso))
        .reduce((s, i) => s + (i.net_minor + i.vat_minor - i.paid_minor), 0);

    // AP outstanding (gross)
    const apOutstanding =
      ap.filter(b => inRange(b.date_iso))
        .reduce((s, b) => s + (b.net_minor + b.vat_minor - b.paid_minor), 0);

    // VAT control (net position in range)
    const vatSales = ar.filter(i => inRange(i.date_iso)).reduce((s, i) => s + i.vat_minor, 0);
    const vatPurch = ap.filter(b => inRange(b.date_iso)).reduce((s, b) => s + b.vat_minor, 0);
    const vatControl = vatSales - vatPurch; // >0 payable, <0 receivable

    const assets = bankTotal + arOutstanding + inventoryMinor + (vatControl < 0 ? Math.abs(vatControl) : 0);
    const liabilities = apOutstanding + (vatControl > 0 ? vatControl : 0);
    const equity = assets - liabilities;

    return {
      banks, bankTotal, arOutstanding, apOutstanding, vatControl, assets, liabilities, equity,
    };
  }, [accounts, txs, ar, ap, period, inventoryMinor]);

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">Balance Sheet</h1>
        <p className="muted">Snapshot at end of period · {period.to}</p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <Separator />

          {/* Assets */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold">Assets</h3>
            <div className="rounded-xl border p-3 bg-card">
              <div className="text-sm font-medium mb-1">Bank & Cash</div>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                {calc.banks.map((b) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <span className="text-muted">{b.name}</span>
                    <span className="font-medium">{formatGBP(b.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-right text-sm">
                <span className="text-muted mr-2">Total</span>
                <span className="font-semibold">{formatGBP(calc.bankTotal)}</span>
              </div>
            </div>

            <div className="rounded-xl border p-3 bg-card">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Accounts Receivable</span>
                <span className="font-medium">{formatGBP(calc.arOutstanding)}</span>
              </div>
            </div>

            <div className="rounded-xl border p-3 bg-card">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Inventory</span>
                <span className="font-medium">{formatGBP(inventoryMinor)}</span>
              </div>
            </div>

            {calc.vatControl < 0 && (
              <div className="rounded-xl border p-3 bg-card">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">VAT Receivable</span>
                  <span className="font-medium">{formatGBP(Math.abs(calc.vatControl))}</span>
                </div>
              </div>
            )}

            <div className="rounded-xl border p-3 bg-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Total Assets</span>
                <span className="text-lg font-bold">{formatGBP(calc.assets)}</span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Liabilities */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold">Liabilities</h3>

            <div className="rounded-xl border p-3 bg-card">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Accounts Payable</span>
                <span className="font-medium">{formatGBP(calc.apOutstanding)}</span>
              </div>
            </div>

            {calc.vatControl > 0 && (
              <div className="rounded-xl border p-3 bg-card">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">VAT Payable</span>
                  <span className="font-medium">{formatGBP(calc.vatControl)}</span>
                </div>
              </div>
            )}

            <div className="rounded-xl border p-3 bg-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Total Liabilities</span>
                <span className="text-lg font-bold">{formatGBP(calc.liabilities)}</span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Equity */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold">Equity</h3>
            <div className="rounded-xl border p-3 bg-card">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Retained Earnings</span>
                <span className="font-medium">{formatGBP(calc.equity)}</span>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>

      <ArrowNav
        backHref="/ship/business/oms/finance/reports/pnl"
        nextHref="/ship/business/oms/finance"
        nextLabel="Finance Hub"
      >
        Finance · Balance Sheet
      </ArrowNav>
    </main>
  );
}