import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

async function readFileSafe(p: string) { try { return await fs.readFile(p, "utf8"); } catch { return ""; } }

export default async function GovernanceBBBPage() {
  const root = path.join(process.cwd(), "corAe-Studio-v2", "GOVERNANCE");
  const coreIndex = await readFileSafe(path.join(root, "core", "INDEX.md"));
  const subject1Updates = await readFileSafe(path.join(root, "subject1", "UPDATES.md"));

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-sky-300">Governance (Read First)</h1>

      <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-slate-950/40 border border-slate-800 rounded-xl p-4">
{coreIndex || "MISSING: GOVENANCE/core/INDEX.md"}
      </pre>

      <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-slate-950/40 border border-slate-800 rounded-xl p-4 max-h-[320px] overflow-auto">
{subject1Updates || "No Subject 1 updates yet."}
      </pre>

      <p className="text-xs text-slate-500">BBB rule: read-only in this OS. Subject 1 updates happen in Studio only.</p>
    </main>
  );
}
