// apps/studio/app/work/onboarding/wizard/finance/page.tsx
"use client";

/**
 * corAe â€¢ Work â€¢ Onboarding â€¢ Finance Wizard
 * Purpose:
 *   - Configure finance basics during Work onboarding.
 *   - Owners/HR: define Chart of Accounts (CoA), connect bank feed, taxation options.
 *   - Worker (Finance role): confirm account mappings, sync statements.
 */

import React, { useState } from "react";

type StepKey = "WELCOME" | "COA" | "BANK" | "TAX" | "SUMMARY" | "SUCCESS";

interface FinanceState {
  step: StepKey;
  industry: string;
  coaSeeded: boolean;
  bankConnected: boolean;
  taxRegistered: boolean;
  bankProvider: string;
  bankAuth: Record<string, any>;
  accountId?: string;
  summaryJson: string;
}

const init: FinanceState = {
  step: "WELCOME",
  industry: "",
  coaSeeded: false,
  bankConnected: false,
  taxRegistered: false,
  bankProvider: "",
  bankAuth: {},
  accountId: undefined,
  summaryJson: "",
};

export default function FinanceOnboardingWizardPage() {
  const [s, setS] = useState<FinanceState>(init);

  async function seedCoA() {
    if (!s.industry) return;
    await fetch("/api/work/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seedCoA", industry: s.industry }),
    });
    setS((x) => ({ ...x, coaSeeded: true, step: "BANK" }));
  }

  async function connectBank() {
    if (!s.bankProvider) return;
    await fetch("/api/work/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "connectBankFeed", provider: s.bankProvider, auth: s.bankAuth }),
    });
    setS((x) => ({ ...x, bankConnected: true, step: "TAX" }));
  }

  async function registerTax() {
    await fetch("/api/work/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "syncStatements", accountId: s.accountId ?? "default" }),
    });
    setS((x) => ({ ...x, taxRegistered: true, step: "SUMMARY" }));
  }

  function finish() {
    const summary = {
      industry: s.industry,
      coaSeeded: s.coaSeeded,
      bankConnected: s.bankConnected,
      taxRegistered: s.taxRegistered,
      bankProvider: s.bankProvider,
      createdAt: new Date().toISOString(),
    };
    setS((x) => ({ ...x, summaryJson: JSON.stringify(summary, null, 2), step: "SUCCESS" }));
  }

  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-8">
      <h1 className="text-2xl font-semibold">Finance Onboarding Wizard</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Configure finance & accounting integrations for your workspace.
      </p>

      {s.step === "WELCOME" && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold mb-3">Welcome</h2>
          <p className="text-sm mb-3">
            Letâ€™s connect your financial foundations. First, choose your business industry.
          </p>
          <select
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
            value={s.industry}
            onChange={(e) => setS({ ...s, industry: e.target.value as string })}
          >
            <option value="">Select Industry</option>
            <option value="RETAIL">Retail</option>
            <option value="HOSPITALITY">Hospitality</option>
            <option value="SERVICES">Services</option>
            <option value="MANUFACTURING">Manufacturing</option>
            <option value="OTHER">Other</option>
          </select>
          <div className="mt-4 flex gap-2">
            <button
              onClick={seedCoA}
              disabled={!s.industry}
              className="rounded-xl bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {s.step === "BANK" && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold mb-3">Connect Bank Feed</h2>
          <input
            placeholder="Bank provider (e.g., Emirates NBD, HSBC)"
            value={s.bankProvider}
            onChange={(e) => setS({ ...s, bankProvider: e.target.value })}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm mb-3"
          />
          <button
            onClick={connectBank}
            disabled={!s.bankProvider}
            className="rounded-xl bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium"
          >
            Connect
          </button>
        </section>
      )}

      {s.step === "TAX" && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold mb-3">Register for Tax / VAT</h2>
          <p className="text-sm text-zinc-300 mb-3">
            Once your tax registration or sync is ready, confirm below.
          </p>
          <button
            onClick={registerTax}
            className="rounded-xl bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium"
          >
            Confirm Tax Sync
          </button>
        </section>
      )}

      {s.step === "SUMMARY" && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold mb-3">Summary</h2>
          <p className="text-sm text-zinc-300 mb-4">Review your configuration before saving.</p>
          <ul className="text-sm text-zinc-300 list-disc pl-6 mb-4">
            <li>Industry: {s.industry}</li>
            <li>CoA Seeded: {s.coaSeeded ? "Yes" : "No"}</li>
            <li>Bank Connected: {s.bankConnected ? "Yes" : "No"}</li>
            <li>Tax Registered: {s.taxRegistered ? "Yes" : "No"}</li>
          </ul>
          <button
            onClick={finish}
            className="rounded-xl bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium"
          >
            Finish
          </button>
        </section>
      )}

      {s.step === "SUCCESS" && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold mb-3">Finance Setup Complete ðŸŽ‰</h2>
          <pre className="text-xs bg-black/40 p-3 rounded-xl overflow-auto">{s.summaryJson}</pre>
        </section>
      )}
    </div>
  );
}
