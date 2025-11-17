"use client";

import React, { useState } from "react";

export default function AtlasGateButton({ pillarId }: { pillarId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function runPreflight() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/caia/dev/preflight", { method: "POST" });
      const json = await res.json();
      if (json.ok) setResult(`OK (exit ${json.exitCode ?? 0})`);
      else setResult(`Failed${json.exitCode ? ` (exit ${json.exitCode})` : ""}`);
    } catch (e) {
      setResult(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        onClick={runPreflight}
        disabled={loading}
        className="rounded bg-neutral-900 px-3 py-1 text-white text-sm disabled:opacity-50"
      >
        {loading ? "Running…" : "Open Gate"}
      </button>
      {result ? <div className="text-xs text-neutral-600">{result}</div> : null}
    </div>
  );
}
