import fs from "fs";
import path from "path";

type GateRun = {
  id: string;
  when: string;
  mode: string;
  decisions: any[];
};

function loadRuns(): GateRun[] {
  const dir = path.join(process.cwd(), ".corae", "logs", "dev-gate");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).slice(-20);
  try {
    return files
      .map((f) => {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
        return {
          id: f.replace(".json", ""),
          when: data.time ?? data.when ?? "unknown",
          mode: data.mode ?? "unknown",
          decisions: data.decisions ?? [],
        } as GateRun;
      })
      .reverse();
  } catch {
    return [];
  }
}

export default function GateLogsPage() {
  const runs = loadRuns();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Developer Gate Runs</h1>
      <p className="text-sm opacity-70">Snapshot of recent CAIA Dev Gate decisions in calm mode.</p>

      {runs.length === 0 ? (
        <p className="text-sm opacity-60">No runs recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => (
            <div key={run.id} className="border rounded-md p-3 space-y-1">
              <div className="font-semibold text-sm">{run.when} — {run.mode}</div>
              <ul className="text-xs list-disc pl-4">
                {run.decisions.map((d: any, i: number) => (
                  <li key={i}>{d.prompt ?? d.id ?? i}: <span className="font-mono">{String(d.answer ?? d.choice ?? '')}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
