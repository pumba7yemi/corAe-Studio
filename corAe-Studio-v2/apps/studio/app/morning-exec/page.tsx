// app/morning-exec/page.tsx
// Server Component (Next.js App Router)

type KPI = { label: string; value: string | number; delta?: string };
type RiskOrOpp = { text: string; level?: "low" | "med" | "high" };
type ActionItem = { text: string; due?: string; link?: string };

type MorningExecData = {
  dateISO: string;
  business: string;
  kpis: KPI[];
  risks: RiskOrOpp[];
  actions: ActionItem[];
};

function badge(level?: "low" | "med" | "high") {
  const map = {
    low: "bg-emerald-100 text-emerald-800",
    med: "bg-amber-100 text-amber-800",
    high: "bg-rose-100 text-rose-800",
  } as const;
  if (!level) return null;
  return <span className={`ml-2 rounded px-2 py-0.5 text-xs ${map[level]}`}>{level}</span>;
}

function formatValue(v: string | number) {
  if (typeof v === "number") return v.toLocaleString();
  return v;
}

async function getData(): Promise<MorningExecData | null> {
  try {
    // Use relative path; Next will resolve to same origin.
    const res = await fetch("/api/morning-exec", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");
    return (await res.json()) as MorningExecData;
  } catch {
    return null;
  }
}

export default async function MorningExecPage() {
  const data = await getData();

  // Fallback dummy content if API not wired yet
  const now = new Date();
  const fallback: MorningExecData = {
    dateISO: now.toISOString(),
    business: "corAe Mothership",
    kpis: [
      { label: "Sales (AED)", value: "—" },
      { label: "Cash Position (AED)", value: "—" },
      { label: "Stock Alerts", value: "—" },
    ],
    risks: [
      { text: "No live feed connected yet (using demo data)", level: "low" },
    ],
    actions: [
      { text: "Connect /api/morning-exec to your data source", due: "Today" },
    ],
  };

  const view = data ?? fallback;
  const when = new Date(view.dateISO).toLocaleString();

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">MorningExec — Today’s Pulse</h1>
        <p className="text-slate-600 mt-1">{view.business} • {when}</p>
      </header>

      {/* Key Numbers */}
      <section className="rounded-xl border p-4 bg-white shadow">
        <h2 className="font-semibold text-lg">📊 Key Numbers</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-3">
          {view.kpis.map((kpi, i) => (
            <li key={i} className="rounded-lg border p-3">
              <div className="text-sm text-slate-500">{kpi.label}</div>
              <div className="text-xl font-semibold">{formatValue(kpi.value)}</div>
              {kpi.delta && <div className="text-xs text-slate-500 mt-1">{kpi.delta}</div>}
            </li>
          ))}
        </ul>
      </section>

      {/* Risks & Opportunities */}
      <section className="rounded-xl border p-4 bg-white shadow">
        <h2 className="font-semibold text-lg">🔍 Critical Risks & Opportunities</h2>
        <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
          {view.risks.map((r, i) => (
            <li key={i} className="flex items-start">
              <span>{r.text}</span>
              {badge(r.level)}
            </li>
          ))}
        </ul>
      </section>

      {/* Immediate Actions */}
      <section className="rounded-xl border p-4 bg-white shadow">
        <h2 className="font-semibold text-lg">✅ Immediate Actions</h2>
        <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
          {view.actions.map((a, i) => (
            <li key={i}>
              <span className="font-medium">{a.text}</span>
              {a.due && <span className="ml-2 text-xs text-slate-500">({a.due})</span>}
              {/* If you add links later, render them here */}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
