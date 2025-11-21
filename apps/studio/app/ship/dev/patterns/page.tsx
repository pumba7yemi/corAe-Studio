import fs from "fs";
import path from "path";

type Pattern = {
  id: string;
  key: string;
  count: number;
  lastApplied?: string;
};

function loadPatterns(): Pattern[] {
  const file = path.join(process.cwd(), ".corae", "caia.patterns.json");
  if (!fs.existsSync(file)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return data.patterns ?? [];
  } catch {
    return [];
  }
}

export default function PatternsPage() {
  const patterns = loadPatterns();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">CAIA Pattern Memory</h1>
      <p className="text-sm opacity-70">Auto-applied decisions & habits CAIA has learned.</p>

      {patterns.length === 0 ? (
        <p className="text-sm opacity-60">No patterns recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {patterns.map((p) => (
            <div key={p.id} className="border rounded-md p-3">
              <div className="font-semibold text-sm">{p.key}</div>
              <div className="text-xs">
                Count: {p.count}
                {p.lastApplied && <> • Last: {p.lastApplied}</>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
