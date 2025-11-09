// apps/shipyard/app/page.tsx
import fs from "node:fs/promises";
import path from "node:path";
import BuildSelector from "../components/BuildSelector";
import GenerateButton from "../components/GenerateButton";

type Artifact = { name: string; size: number; mtime: number; kind: "white-label" | "core"; version?: string };

const ROOT = path.join(process.cwd(), "..", "..");
const DIST_DIR = path.join(ROOT, "dist");

function parseKindAndVersion(file: string): { kind: "white-label" | "core"; version?: string } {
  // heuristics:
  //  - white-label: names like wl-<brand>-<version>.zip OR contain "wl" or "white"
  //  - core: names like corae-<version>.zip OR contain "core" or "corae"
  const lower = file.toLowerCase();
  if (lower.startsWith("wl-") || lower.includes("white")) {
    // try to grab a semver-ish group at the end
    const m = lower.match(/(\d+\.\d+\.\d+(-[\w.]+)?)/);
    return { kind: "white-label", version: m?.[1] };
  }
  if (lower.startsWith("corae-") || lower.includes("core") || lower.includes("corae")) {
    const m = lower.match(/(\d+\.\d+\.\d+(-[\w.]+)?)/);
    return { kind: "core", version: m?.[1] };
  }
  // default to core if unknown
  return { kind: "core" };
}

async function listArtifacts(): Promise<Artifact[]> {
  try {
    const entries = await fs.readdir(DIST_DIR, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile() && e.name.endsWith(".zip"));
    const out: Artifact[] = [];
    for (const f of files) {
      const p = path.join(DIST_DIR, f.name);
      const s = await fs.stat(p);
      const meta = parseKindAndVersion(f.name);
      out.push({ name: f.name, size: s.size, mtime: s.mtimeMs, ...meta });
    }
    return out.sort((a, b) => b.mtime - a.mtime);
  } catch {
    return [];
  }
}

async function readPromotion() {
  const manifest = path.join(process.cwd(), ".ship", "manifest.json");
  try {
    const raw = await fs.readFile(manifest, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ShipyardPage() {
  const [artifacts, promo] = await Promise.all([listArtifacts(), readPromotion()]);

  return (
    <main className="space-y-8 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">⚙️ Shipyard Portal 3500</h1>
        <p className="text-sm text-slate-600">
          Generate builds, promote to prototype, and open white-label or corAe core ships.
        </p>
      </header>

      {/* Live / Prototype status */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Live Prototype</h2>
          <a
            className="rounded-xl bg-black px-3 py-1.5 text-xs text-white hover:bg-slate-800"
            href="/prototype"
          >
            Open Prototype
          </a>
        </div>
        {!promo ? (
          <p className="mt-2 text-sm text-slate-700">No build promoted yet.</p>
        ) : (
          <div className="mt-2 text-sm text-slate-700">
            <div>Source: <code>{promo.sourceFile}</code></div>
            <div>Promoted at: {new Date(promo.promotedAt).toLocaleString()}</div>
            <div className="text-slate-500">Payload directory: <code>.ship/{promo.payloadDir}</code></div>
          </div>
        )}
      </section>

      {/* Generate + Select + Promote/Open */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Build Controls</h2>
        <p className="text-sm text-slate-600">Generate, select, and promote builds to prototype.</p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <GenerateButton />
          <a
            href="/studio"
            className="rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50"
            target="_blank"
          >
            Open Studio (3000)
          </a>
        </div>

        <div className="mt-4">
          <BuildSelector initial={artifacts} />
        </div>
      </section>

      {/* Raw build list (root/dist) */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold mb-2">Builds (root/dist)</h2>
        {artifacts.length === 0 ? (
          <p className="text-sm text-slate-600">No builds found. Use Generate or build from Studio.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 pr-3">File</th>
                  <th className="py-2 pr-3">Kind</th>
                  <th className="py-2 pr-3">Version</th>
                  <th className="py-2 pr-3">Size</th>
                  <th className="py-2 pr-3">Modified</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {artifacts.map((a) => (
                  <tr key={a.name} className="border-t">
                    <td className="py-2 pr-3 font-mono text-xs">{a.name}</td>
                    <td className="py-2 pr-3 capitalize">{a.kind}</td>
                    <td className="py-2 pr-3">{a.version ?? "—"}</td>
                    <td className="py-2 pr-3">{fmtSize(a.size)}</td>
                    <td className="py-2 pr-3">{new Date(a.mtime).toLocaleString()}</td>
                    <td className="py-2 flex gap-2">
                      <a
                        className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-900"
                        href={`/api/shipyard/download?file=${encodeURIComponent(a.name)}`}
                      >
                        Download
                      </a>
                      <form action={`/api/shipyard/promote`} method="post">
                        <input type="hidden" name="file" value={a.name} />
                        <button
                          className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                          type="submit"
                        >
                          Promote
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
    </main>
  );
}