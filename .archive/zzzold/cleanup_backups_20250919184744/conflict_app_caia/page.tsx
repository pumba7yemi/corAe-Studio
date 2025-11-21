// app/caia/page.tsx
export const dynamic = "force-dynamic";

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
  return typeof v === "number" ? v.toLocaleString() : v;
}

async function getMorningExec(): Promise<MorningExecData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/morning-exec`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed");
    return (await res.json()) as MorningExecData;
  } catch {
    return null;
  }
}

export default async function CaiaPage() {
  const data = await getMorningExec();

  // graceful fallback if API not wired yet
  const now = new Date();
  const view: MorningExecData =
    data ?? {
      dateISO: now.toISOString(),
      business: "corAe Mothership",
      kpis: [
        { label: "Sales (AED)", value: "—" },
        { label: "Cash Position (AED)", value: "—" },
        { label: "Stock Alerts", value: "—" },
      ],
      risks: [{ text: "No live feed connected yet (using demo view)", level: "low" }],
      actions: [{ text: "Connect /api/morning-exec to your data source", due: "Today" }],
    };

  const when = new Date(view.dateISO).toLocaleString();

  return (
    <div className="stack p-6 space-y-6">
      <h1 className="text-3xl font-bold">CAIA</h1>
      <p className="muted text-slate-600">
        System brain. Snapshot across OMS, Comms, 3³DTD, and CIMS.
      </p>

      <div className="rounded-xl border p-4 bg-white shadow">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">📊 Today’s Pulse</h2>
          <div className="text-sm text-slate-500">{view.business} • {when}</div>
        </div>
        <p className="small muted">Top numbers • Risks • Actions (live from MorningExec)</p>

        {/* Key Numbers */}
        <section className="mt-4">
          <h3 className="font-medium text-lg">Key Numbers</h3>
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {view.kpis.map((k, i) => (
              <li key={i} className="rounded-lg border p-3">
                <div className="text-sm text-slate-500">{k.label}</div>
                <div className="text-xl font-semibold">{formatValue(k.value)}</div>
                {k.delta && <div className="text-xs text-slate-500 mt-1">{k.delta}</div>}
              </li>
            ))}
          </ul>
        </section>

        {/* Risks & Opportunities */}
        <section className="mt-6">
          <h3 className="font-medium text-lg">Critical Risks & Opportunities</h3>
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
        <section className="mt-6">
          <h3 className="font-medium text-lg">Immediate Actions</h3>
          <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
            {view.actions.map((a, i) => (
              <li key={i}>
                <span className="font-medium">{a.text}</span>
                {a.due && <span className="ml-2 text-xs text-slate-500">({a.due})</span>}
                {a.link && (
                  <a href={a.link} className="ml-3 text-indigo-600 hover:underline">
                    Go
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}