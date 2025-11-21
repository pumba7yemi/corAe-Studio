"use client";
import { useState } from "react";

export default function CAIATestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    const r = await fetch("/api/caia/test");
    const j = await r.json();
    setData(j);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">CAIA Test</h1>
      <button className="px-3 py-2 border rounded-md" onClick={run} disabled={loading}>
        {loading ? "Running…" : "Run Demo Workflow"}
      </button>
      {data && (
        <pre className="text-xs bg-neutral-950/60 text-neutral-100 p-3 rounded-lg overflow-auto max-h-[60vh]">
{JSON.stringify(data, null, 2)}
        </pre>
      )}
      <p className="text-sm text-neutral-600">This calls: Adapter → Dispatcher → Runtime → Memory.</p>
    </div>
  );
}
