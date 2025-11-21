"use client";
import React, { useEffect, useState } from "react";

type Context = { pillar: string | null; track: string | null } | null;
type Status = { ok: boolean | null; exitCode: number | null; command?: string; stdout?: string; stderr?: string } | null;

export default function DevAgentOverview(): JSX.Element {
  const [context, setContext] = useState<Context>(null);
  const [loadingPreflight, setLoadingPreflight] = useState(false);
  const [loadingNightly, setLoadingNightly] = useState(false);
  const [statusPreflight, setStatusPreflight] = useState<Status>(null);
  const [statusNightly, setStatusNightly] = useState<Status>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/caia/dev/context")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        setContext({ pillar: j.pillar ?? null, track: j.track ?? null });
      })
      .catch(() => {
        if (!mounted) return;
        setContext({ pillar: null, track: null });
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function runPreflight() {
    setLoadingPreflight(true);
    try {
      const res = await fetch("/api/caia/dev/preflight", { method: "POST" });
      const js = await res.json();
      setStatusPreflight({ ok: js.ok ?? false, exitCode: js.exitCode ?? null, command: js.command, stdout: js.stdout, stderr: js.stderr });
    } catch (err) {
      setStatusPreflight({ ok: false, exitCode: -1, stderr: String(err) });
    } finally {
      setLoadingPreflight(false);
    }
  }

  async function runNightly() {
    setLoadingNightly(true);
    try {
      const res = await fetch("/api/caia/dev/nightly", { method: "POST" });
      const js = await res.json();
      setStatusNightly({ ok: js.ok ?? false, exitCode: js.exitCode ?? null, command: js.command, stdout: js.stdout, stderr: js.stderr });
    } catch (err) {
      setStatusNightly({ ok: false, exitCode: -1, stderr: String(err) });
    } finally {
      setLoadingNightly(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="rounded-xl border p-4 space-y-2">
        <h2 className="font-semibold">CAIA Context</h2>
        <div className="text-sm text-neutral-700">
          <div>
            <strong>Pillar:</strong> {context ? context.pillar ?? <em>Not set</em> : <em>Loading…</em>}
          </div>
          <div>
            <strong>Track:</strong> {context ? context.track ?? <em>Not set</em> : <em>Loading…</em>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4 space-y-2">
        <h2 className="font-semibold">Preflight</h2>
        <div className="flex items-center gap-3">
          <button
            className="px-3 py-1.5 rounded-md border text-sm disabled:opacity-60"
            onClick={runPreflight}
            disabled={loadingPreflight}
          >
            {loadingPreflight ? "Running…" : "Run Preflight"}
          </button>
          {statusPreflight && (
            <div className="text-sm">
              {statusPreflight.ok ? (
                <span className="text-green-600">Preflight OK (exitCode {statusPreflight.exitCode})</span>
              ) : (
                <span className="text-red-600">Preflight FAILED (exitCode {statusPreflight.exitCode})</span>
              )}
            </div>
          )}
        </div>
        {statusPreflight?.stdout && (
          <pre className="mt-2 text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded">{statusPreflight.stdout}</pre>
        )}
        {statusPreflight?.stderr && (
          <pre className="mt-2 text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded text-red-700">{statusPreflight.stderr}</pre>
        )}
      </div>

      <div className="rounded-xl border p-4 space-y-2">
        <h2 className="font-semibold">Nightly (manual)</h2>
        <div className="flex items-center gap-3">
          <button
            className="px-3 py-1.5 rounded-md border text-sm disabled:opacity-60"
            onClick={runNightly}
            disabled={loadingNightly}
          >
            {loadingNightly ? "Running…" : "Run Nightly (manual)"}
          </button>
          {statusNightly && (
            <div className="text-sm">
              {statusNightly.ok ? (
                <span className="text-green-600">Nightly OK (exitCode {statusNightly.exitCode})</span>
              ) : (
                <span className="text-red-600">Nightly FAILED (exitCode {statusNightly.exitCode})</span>
              )}
            </div>
          )}
        </div>
        {statusNightly?.stdout && (
          <pre className="mt-2 text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded">{statusNightly.stdout}</pre>
        )}
        {statusNightly?.stderr && (
          <pre className="mt-2 text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded text-red-700">{statusNightly.stderr}</pre>
        )}
      </div>
    </div>
  );
}
