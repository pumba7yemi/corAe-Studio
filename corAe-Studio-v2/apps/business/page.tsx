// apps/studio/app/ship/business/page.tsx

export const dynamic = "force-dynamic";

export default function BusinessPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-sky-300">Business</h1>
        <p className="text-sm text-slate-400">
          OMS • OBARI • Finance • HR • Management • Workflows
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/ship/business/oms"
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">OMS</h3>
          <p className="text-xs text-slate-400">Orders, products, fulfilment.</p>
        </a>
        <a
          href="/ship/business/oms/obari"
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">OBARI™</h3>
          <p className="text-xs text-slate-400">
            Flow engine for booking, active, reporting, invoice.
          </p>
        </a>
        <a
          href="/ship/business/oms/finance"
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">Finance</h3>
          <p className="text-xs text-slate-400">
            Revenue • expenses • cashflow • P&amp;L.
          </p>
        </a>
        <a
          href="/ship/business/oms/hr"
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">HR</h3>
          <p className="text-xs text-slate-400">
            Roster • contracts • compliance.
          </p>
        </a>
        <a
          href="/ship/business/oms/management"
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">Management</h3>
          <p className="text-xs text-slate-400">KPIs • reviews • decisions.</p>
        </a>
        <a
          href="/ship/business/workflows"
          className="border border-slate-700 rounded-xl p-4 hover:border-sky-500 hover:bg-slate-800/40 transition"
        >
          <h3 className="font-semibold text-sky-200 mb-1">Workflows</h3>
          <p className="text-xs text-slate-400">Automations across the stack.</p>
        </a>
      </section>
    </div>
  );
}