// apps/studio/app/ship/business/onboarding/page.tsx
"use client";

import Link from "next/link";

export default function BusinessOnboardingIndexPage() {
  const cards = [
    {
      t: "🏁 Start Company",
      d: "Create company, enable core modules, kick OBARI.",
      h: "/ship/business/onboarding/start-company",
    },
    {
      t: "🧾 Tax & VAT",
      d: "Register tax/VAT; store IDs and filing cadence.",
      h: "/ship/business/onboarding/tax",
    },
    {
      t: "💳 Finance",
      d: "Chart of Accounts, bank links, payment rails.",
      h: "/ship/business/onboarding/finance",
    },
    {
      t: "⚙️ Operations",
      d: "Order → Booking → Active → Reporting → Invoice.",
      h: "/ship/business/onboarding/operations",
    },
    {
      t: "👥 Roles & Partners",
      d: "Owners, Finance, Ops, Workflow Partners.",
      h: "/ship/business/onboarding/partners",
    },
    {
      t: "🧠 OMS (OBARI)",
      d: "SLA, escalation, messaging & finance hooks.",
      h: "/ship/business/oms/onboarding",
    },
  ];

  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-32">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Business Onboarding</h1>
          <Link
            href="/ship/business/onboarding/flows"
            className="rounded-xl border border-indigo-700 bg-indigo-950/40 hover:bg-indigo-900/40 px-4 py-2 text-sm"
          >
            Flows →
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Configure your company and wire core automations.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.t}
              href={c.h}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:bg-zinc-900/60 transition"
            >
              <div className="text-lg font-semibold mb-1">{c.t}</div>
              <div className="text-sm text-zinc-400">{c.d}</div>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/ship/business/oms"
            className="inline-block rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 px-4 py-2 text-sm"
          >
            ← Back to OMS
          </Link>
        </div>
      </div>
    </div>
  );
}