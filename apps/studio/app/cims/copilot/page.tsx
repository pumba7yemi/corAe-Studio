// apps/studio/app/cims/copilot/page.tsx
import fs from "node:fs/promises";
import path from "node:path";
import { processNextQueuedJob, getLatestReport } from "../../lib/copilot/orchestrator";
import Link from "next/link";

// Server Component — reads latest report from FS and offers a "Run Now" server action.
// Keeps Studio read-only: Copilot changes write to build/.data only.
export const dynamic = "force-dynamic";

async function listQueuedJobs() {
  const ROOT = path.join(process.cwd(), "build", ".data");
  const FILE = path.join(ROOT, "copilot", "jobs.json");
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const jobs = JSON.parse(raw) as any[];
    const queued = jobs.filter((j) => j.status === "queued");
    return { queued, count: queued.length };
  } catch {
    return { queued: [], count: 0 };
  }
}

async function runOnceAction() {
  "use server";
  await processNextQueuedJob();
}

export default async function CopilotPanelPage() {
  const latest = await getLatestReport();
  const q = await listQueuedJobs();

  return (
    <div className="p-6 space-y-6">
      <div className="text-2xl font-semibold">Copilot — Orchestrator</div>

      <form action="">
        <button
          className="px-4 py-2 rounded-2xl border text-sm hover:opacity-90"
          title="Run the next queued job once"
        >
          Run Next Queued Job
        </button>
        <span className="ml-3 text-sm text-gray-500">
          {q.count} queued
        </span>
      </form>

      <div className="border rounded-2xl p-4">
        <div className="font-medium mb-2">Latest Report</div>
        {!latest ? (
          <div className="text-sm text-gray-500">No reports yet.</div>
        ) : (
          <div className="text-sm space-y-2">
            <div><span className="font-medium">Job:</span> {latest.jobId}</div>
            <div>
              <span className="font-medium">Status:</span>{" "}
              <span className={latest.status === "succeeded" ? "text-green-600" : latest.status === "failed" ? "text-red-600" : ""}>
                {latest.status}
              </span>
            </div>
            <div><span className="font-medium">Started:</span> {latest.startedAt}</div>
            <div><span className="font-medium">Finished:</span> {latest.finishedAt}</div>
            <div className="mt-2">
              <div className="font-medium">Files changed</div>
              {latest.filesChanged.length === 0 ? (
                <div className="text-gray-500">—</div>
              ) : (
                <ul className="list-disc ml-6">
                  {latest.filesChanged.map((f) => (
                    <li key={f}><code>{f}</code></li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-2">
              <div className="font-medium">Guards</div>
              <ul className="list-disc ml-6">
                <li>Prisma Validate: {latest.guard.prismaValidate.ok ? "OK" : "FAIL"}</li>
                <li>Typecheck: {latest.guard.typecheck.ok ? "OK" : "FAIL"}</li>
                {"lint" in latest.guard && (
                  <li>ESLint: {(latest.guard as any).lint.ok ? "OK" : "FAIL"}</li>
                )}
                <li>Pass: {latest.guard.pass ? "YES" : "NO"}</li>
              </ul>
            </div>
            {latest.notes?.length ? (
              <div className="mt-2">
                <div className="font-medium">Notes</div>
                <ul className="list-disc ml-6">
                  {latest.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        UI is read-only; Copilot writes to <code>build/.data</code>. Commits remain manual.
      </div>

      <div className="text-xs text-gray-500">
        Tip: use the Wizard “Finish” step to enqueue a job. This panel then runs the next queued job.
      </div>

      <Link href="/cims" className="inline-block text-sm underline mt-2">Back to CIMS</Link>
    </div>
  );
}