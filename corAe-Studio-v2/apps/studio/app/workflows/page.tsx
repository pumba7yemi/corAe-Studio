// app/workflows/page.tsx
export const dynamic = "force-dynamic";

type Item = {
  key: string;
  name: string;
  time: string;      // ISO
  summary: string;
  ctaLabel: string;
  ctaHref: string;
  repeat?: string;
};

type Resp = { tz: string; items: Item[] };

function fmt(t: string) {
  const d = new Date(t);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default async function WorkflowsPage() {
  let data: Resp | null = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/workflows`, { cache: "no-store" });
    if (res.ok) data = await res.json();
  } catch {}

  const items = data?.items ?? [];

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Chronological Workflows</h1>
        <p className="text-slate-600 mt-1">Today • ordered by time • {data?.tz ?? "local time"}</p>
      </header>

      <ol className="relative border-s-2 border-slate-200 pl-6 space-y-6">
        {items.map((it) => (
          <li key={it.key} className="relative">
            <span className="absolute -start-[11px] top-1 h-5 w-5 rounded-full bg-white border-2 border-indigo-500" />
            <div className="rounded-xl border p-4 bg-white shadow-sm">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-semibold">{it.name}</h3>
                <div className="text-sm text-slate-500">{fmt(it.time)}</div>
              </div>
              <p className="text-slate-700 mt-1">{it.summary}</p>
              {it.repeat && <p className="text-xs text-slate-500 mt-1">Repeat: {it.repeat}</p>}
              <div className="mt-3">
                <a href={it.ctaHref} className="inline-block px-3 py-1.5 rounded-md border bg-black text-white text-sm hover:opacity-90">
                  {it.ctaLabel}
                </a>
              </div>
              {/* Work Focus Core Principle prompt */}
              <div className="mt-3 text-sm text-slate-600">
                <strong>Have you</strong> completed this?{" "}
                <em>If not → do it now.</em>{" "}
                <em>If yes → move to next.</em>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
