// apps/studio/app/studio/page.tsx

// CAIAHost lives at: corAe-Studio/src/components/CAIAHost.tsx
import CAIAHost from "@/components/CAIAHost";

// Studio-local pieces live under apps/studio
// ShipButton: corAe-Studio/apps/studio/components/ship/ShipButton.tsx
import ShipButton from "../../components/ship/ShipButton";

// SMSME button/card: corAe-Studio/apps/studio/components/smsme/SMSMEControl.tsx
import SMSMEControl from "@/components/SMSMEControl";

// Build log helpers: corAe-Studio/apps/studio/lib/build/{log,artifacts}.ts
import { readEvents, type BuildEvent } from "../../lib/build/log";
import { listArtifacts, type Artifact } from "../../lib/build/artifacts";

export const metadata = {
  title: "corAe Studio",
  description: "Build, ship, and manage your corAe apps.",
};

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function StudioPage() {
  let events: BuildEvent[] = [];
  let artifacts: Artifact[] = [];

  try { events = await readEvents(50); } catch {}
  try { artifacts = await listArtifacts(); } catch {}

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">corAe Studio</h1>
        <p className="text-sm text-slate-600">Your single place to build, ship, and review.</p>
      </header>

      {/* Host / Companion */}
      <CAIAHost />

      {/* SMSME / SchemaMind runner */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">SchemaMind / SMSME</h2>
          <span className="text-xs text-slate-500">Diff → Plan → SQL (examples/old → next)</span>
        </div>
        <SMSMEControl />
        <p className="mt-2 text-xs text-slate-500">
          One-click generates <code>plan.json</code> and <code>migration.sql</code> inside <code>smsme-core/</code>.
        </p>
      </section>

      {/* One-Build card */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Create corAe Ship</h2>
          <span className="text-xs text-slate-500">Exports a ZIP to /dist</span>
        </div>
        <ShipButton />
        <p className="mt-2 text-xs text-slate-500">
          After shipping, you can promote a build to Shipyard (port 3500) to run the live surface.
        </p>
      </section>

      {/* Artifacts */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Builds (dist)</h2>
          <a className="text-xs underline" href="http://localhost:3500" target="_blank" rel="noreferrer">
            Open Shipyard
          </a>
        </div>

        {artifacts.length === 0 ? (
          <p className="text-sm text-slate-600">No builds yet. Click “Create corAe Ship” to make one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 pr-3">File</th>
                  <th className="py-2 pr-3">Size</th>
                  <th className="py-2 pr-3">Modified</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {artifacts.map((a) => (
                  <tr key={a.name} className="border-t">
                    <td className="py-2 pr-3 font-mono text-xs">{a.name}</td>
                    <td className="py-2 pr-3 text-slate-700">{fmtSize(a.size)}</td>
                    <td className="py-2 pr-3 text-slate-700">{new Date(a.mtime).toLocaleString()}</td>
                    <td className="py-2 flex items-center gap-2">
                      <a
                        className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-900"
                        href={`/api/ship/download?file=${encodeURIComponent(a.name)}`}
                      >
                        Download
                      </a>
                      <form action={`/api/ship/promote?file=${encodeURIComponent(a.name)}`} method="post">
                        <button
                          type="submit"
                          className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                          title="Promote this build into Shipyard"
                        >
                          Promote to Shipyard
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Build Log */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Build Log</h2>
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-slate-600">No build activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Level</th>
                  <th className="py-2 pr-3">Scope</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {events
                  .slice()
                  .reverse()
                  .map((ev, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 pr-3 whitespace-nowrap font-mono text-xs text-slate-600">
                        {new Date(ev.ts).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={[
                            "rounded-md px-2 py-0.5 text-xs",
                            ev.level === "ERROR"
                              ? "bg-red-50 text-red-700"
                              : ev.level === "WARN"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700",
                          ].join(" ")}
                        >
                          {ev.level}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-slate-700">{ev.scope}</td>
                      <td className="py-2 pr-3 text-slate-700">{ev.action}</td>
                      <td className="py-2 text-slate-600">
                        {ev.notes ?? ""}
                        {ev.file ? <span className="block text-xs text-slate-500">{ev.file}</span> : null}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
