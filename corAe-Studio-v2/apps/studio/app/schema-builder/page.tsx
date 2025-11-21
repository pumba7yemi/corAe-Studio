"use client";
import { useState } from "react";

async function call(path: string, method: "POST" | "GET" = "POST") {
  const r = await fetch(path, { method });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json().catch(() => ({}));
}

export default function SchemaBuilder() {
  const [log, setLog] = useState("");

  const run = async (label: string, fn: () => Promise<any>) => {
    setLog(`▶ ${label}…`);
    try {
      const d = await fn();
      setLog(`✓ ${label}\n\n${d?.output ?? d?.command ?? JSON.stringify(d, null, 2)}`);
    } catch (e: any) {
      setLog(`✗ ${label}\n\n${e?.message ?? String(e)}`);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Schema Tools</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button className="rounded-xl bg-slate-800 p-4 border border-slate-700 hover:bg-slate-700"
                onClick={() => run("Build Schema",
                  () => call("/api/build-schema/build"))}>
          🌱 Build Schema
          <div className="text-xs text-slate-300 mt-1">
            Combines prisma/schemas → prisma/schema.prisma
          </div>
        </button>

        <button className="rounded-xl bg-slate-800 p-4 border border-slate-700 hover:bg-slate-700"
                onClick={() => run("Generate Prisma Client",
                  () => call("/api/build-schema/generate"))}>
          ⚙️ Generate Prisma Client
          <div className="text-xs text-slate-300 mt-1">Runs prisma generate</div>
        </button>

        <button className="rounded-xl bg-slate-800 p-4 border border-slate-700 hover:bg-slate-700"
                onClick={() => run("Run Migrate Dev",
                  () => call("/api/build-schema/migrate"))}>
          🔁 Run Migrate Dev
          <div className="text-xs text-slate-300 mt-1">Applies changes to SQLite</div>
        </button>

        <button className="rounded-xl bg-slate-800 p-4 border border-slate-700 hover:bg-slate-700"
                onClick={async () => {
                  try {
                    const d = await call("/api/build-schema/studio");
                    window.open(d.url || "http://localhost:5555", "_blank");
                    setLog("✓ Opened Prisma Studio on :5555");
                  } catch (e:any) {
                    setLog(`✗ Open Prisma Studio\n\n${e?.message ?? String(e)}`);
                  }
                }}>
          📊 Open Prisma Studio (5555)
          <div className="text-xs text-slate-300 mt-1">Launch & open in a new tab</div>
        </button>

        <button className="rounded-xl bg-slate-800 p-4 border border-slate-700 hover:bg-slate-700 sm:col-span-2"
                onClick={() => window.open("/api/build-schema/schema", "_blank")}>
          📄 Open schema.prisma
          <div className="text-xs text-slate-300 mt-1">View the unified schema text</div>
        </button>
      </div>

      <pre className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded-lg overflow-auto text-xs whitespace-pre-wrap">
        {log || "No output yet."}
      </pre>
    </div>
  );
}