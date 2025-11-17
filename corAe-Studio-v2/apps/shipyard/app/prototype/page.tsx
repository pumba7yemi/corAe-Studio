// apps/shipyard/app/prototype/page.tsx
import fs from "node:fs/promises";
import path from "node:path";

export default async function PrototypePage() {
  const SHIP_DIR = path.join(process.cwd(), ".ship");
  const manifestPath = path.join(SHIP_DIR, "manifest.json");
  let manifest: any = null;
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch {}

  if (!manifest) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Prototype</h1>
        <p className="text-sm text-slate-600 mt-2">No build promoted yet.</p>
      </main>
    );
  }

  const payloadDir = path.join(SHIP_DIR, manifest.payloadDir);
  let hasIndex = false;
  try {
    await fs.access(path.join(payloadDir, "index.html"));
    hasIndex = true;
  } catch {}

  return (
    <main className="p-0">
      <div className="p-4 border-b">
        <div className="text-sm text-slate-600">
          Source: <code>{manifest.sourceFile}</code> • Promoted {new Date(manifest.promotedAt).toLocaleString()}
        </div>
      </div>

      {hasIndex ? (
        <iframe
          src={`/shipyard-static/${encodeURIComponent(manifest.payloadDir)}/index.html`}
          className="w-full h-[calc(100vh-64px)] border-0"
        />
      ) : (
        <div className="p-6">
          <h2 className="text-base font-semibold mb-2">Payload directory</h2>
          <p className="text-sm text-slate-600">No index.html found. Files were extracted to <code>.ship/{manifest.payloadDir}</code>.</p>
        </div>
      )}
    </main>
  );
}