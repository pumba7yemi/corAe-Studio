// apps/studio/app/business/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BusinessPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-sky-300">Business</h1>
        <p className="text-sm text-slate-400">
          OMS â€¢ OBARI â€¢ Finance â€¢ HR â€¢ Management â€¢ Workflows
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/business/oms"
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">OMS</h3>
          <p className="text-xs text-slate-400">Orders, products, fulfilment.</p>
        </Link>

        <Link
          href="/business/oms/obari"
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">OBARIâ„¢</h3>
          <p className="text-xs text-slate-400">
            Flow engine for booking, active, reporting, invoice.
          </p>
        </Link>

        <Link
          href="/business/oms/finance"
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">Finance</h3>
          <p className="text-xs text-slate-400">
            Revenue â€¢ expenses â€¢ cashflow â€¢ P&amp;L.
          </p>
        </Link>

        <Link
          href="/business/oms/hr"
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">HR</h3>
          <p className="text-xs text-slate-400">
            Roster â€¢ contracts â€¢ compliance.
          </p>
        </Link>

        <Link
          href="/business/oms/management"
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">Management</h3>
          <p className="text-xs text-slate-400">KPIs â€¢ reviews â€¢ decisions.</p>
        </Link>

        <Link
          href={"/business/workflows" as unknown as any}
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">Workflows</h3>
          <p className="text-xs text-slate-400">Automations across the stack.</p>
        </Link>
      </section>
    </div>
  );
}
