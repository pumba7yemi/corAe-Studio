import fs from "node:fs/promises";
import path from "node:path";
import { GovernanceDialog } from "@/../../GOVERNANCE/ui/GovernanceDialog";

export const dynamic = "force-dynamic";

async function readFileSafe(p: string) {
  try { return await fs.readFile(p, "utf8"); } catch { return ""; }
}

export default async function GovernanceCanonicalPage() {
  const root = path.join(process.cwd(), "corAe-Studio-v2", "GOVERNANCE");
  const coreIndex = await readFileSafe(path.join(root, "core", "INDEX.md"));
  const subject1Updates = await readFileSafe(path.join(root, "subject1", "UPDATES.md"));

  const canWrite = true; // Studio = Subject 1 by default

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-sky-300">Canonical Governance (Read First)</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-200">Canonical Core</h2>
        <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-slate-950/40 border border-slate-800 rounded-xl p-4">
{coreIndex || "MISSING: GOVENANCE/core/INDEX.md"}
        </pre>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-200">Subject 1 Layer</h2>
        <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-slate-950/40 border border-slate-800 rounded-xl p-4 max-h-[320px] overflow-auto">
{subject1Updates || "No Subject 1 updates yet."}
        </pre>
      </section>

      <GovernanceDialog canWrite={canWrite} />
    </main>
  );
}
