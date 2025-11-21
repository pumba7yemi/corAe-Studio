// apps/studio/app/business/oms/operations/page.tsx
import fs from "node:fs";
import path from "node:path";

type Row = { name: string; size: number; mtime: string };

const P = (...a: string[]) => path.join(process.cwd(), ...a);
const listDir = (dir: string): Row[] => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map((name) => {
    const stat = fs.statSync(path.join(dir, name));
    return { name, size: stat.size, mtime: stat.mtime.toISOString() };
  }).sort((a,b)=> a.name.localeCompare(b.name));
};

export const dynamic = "force-dynamic"; // always reflect latest files

export default function Operations() {
  const dir = P("data", "oms", "operations");
  const items = listDir(dir);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Operations</h1>
          <p className="text-gray-600">
            SOPs, checklists, shift logs, run-books. Folder: <code className="px-1 bg-gray-100 rounded">data/oms/operations</code>
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/business/oms" className="rounded-lg border px-3 py-2 bg-white hover:bg-gray-50">â† OMS</a>
          <a href="/comms" className="rounded-lg border px-3 py-2 bg-white hover:bg-gray-50">corAe Commsâ„¢</a>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="text-gray-500">â€” no ops items â€”<br/>
          <span className="text-sm">
            Tip: drop any file (e.g. <code>daily_run_2025-09-06.md</code>) into <code>data/oms/operations</code> and refresh.
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Size</th>
                <th className="text-left px-4 py-2">Last updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.name} className="border-t">
                  <td className="px-4 py-2 font-medium">{f.name}</td>
                  <td className="px-4 py-2">{f.size.toLocaleString()} bytes</td>
                  <td className="px-4 py-2">{new Date(f.mtime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

