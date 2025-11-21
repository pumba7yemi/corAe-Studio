// apps/studio/app/ship/work/onboarding/finish/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Wizard — Finish Step
 * - Captures a Have-You chrono prompt
 * - Posts Wizard Blueprint → /api/copilot/reconcile
 * - Shows minimal progress + link to Copilot panel
 *
 * Storage note:
 * We embed the Have-You prompt inside `blueprint.haveYou`
 * so it’s persisted in build/.data/copilot/jobs.json by the Reconcile route.
 */

type ApiResp =
  | { ok: true; jobId: string; status: string; poll: string; ui: string }
  | { ok: false; error: string };

const DEFAULT_BLUEPRINT = {
  name: "Wizard Blueprint v1",
  // Example additive Prisma patch (safe to keep or replace)
  models: {
    WorkNote: {
      fields: `
id           String   @id @default(cuid())
createdAt    DateTime @default(now())
title        String
content      String?
`,
    },
  },
  // Copilot patcher set can use this later if needed
  seeds: { workfocus: ["retail-daily", "salon-daily", "waste-daily"] },
};

export default function FinishPage() {
  const router = useRouter();

  // Safe client-only param getter to avoid useSearchParams prerender bailout.
  function getParam(key: string): string | null {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(key);
  }
  const [haveYou, setHaveYou] = useState<string>(
    "Have you prepared today’s chrono tasks? If no → open WorkFocus; if yes → submit to Copilot."
  );
  const [blueprintText, setBlueprintText] = useState<string>(
    JSON.stringify(DEFAULT_BLUEPRINT, null, 2)
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<ApiResp | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    let parsed: any = null;
    try {
      parsed = JSON.parse(blueprintText);
    } catch {
      setSubmitting(false);
      setResult({ ok: false, error: "Blueprint JSON is invalid." } as any);
      return;
    }

    // Persist Have-You inside the blueprint
    parsed.haveYou = {
      prompt: haveYou,
      createdAt: new Date().toISOString(),
      scope: "work-onboarding-finish",
    };

    try {
      const r = await fetch("/api/copilot/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "wizard",
          blueprint: parsed,
          meta: {
            requestedBy: "Wizard",
            notes: "Finish step submit",
            orgId: getParam("orgId") ?? "demo-org",
            tenantId: getParam("tenantId") ?? null,
          },
        }),
      });

      const json = (await r.json()) as ApiResp;
      setResult(json);
    } catch (err: any) {
      setResult({ ok: false, error: String(err?.message ?? err) } as any);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Finish — Send to Copilot</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Have-You chrono prompt</label>
          <input
            type="text"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={haveYou}
            onChange={(e) => setHaveYou(e.target.value)}
            placeholder="Have you … ? If no → … If yes → …"
          />
          <p className="text-xs text-gray-500">
            This is stored inside the Copilot job blueprint as <code>blueprint.haveYou</code>.
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Wizard Blueprint (JSON)</label>
          <textarea
            className="w-full h-64 rounded-xl border px-3 py-2 text-sm font-mono"
            value={blueprintText}
            onChange={(e) => setBlueprintText(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Keep as-is for a demo run, or paste your generated Wizard blueprint JSON.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-2xl border text-sm hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit to Copilot"}
        </button>
      </form>

      {/* Result / progress */}
      <div className="border rounded-2xl p-4">
        <div className="font-medium mb-2">Progress</div>
        {!result ? (
          <div className="text-sm text-gray-500">Awaiting submission…</div>
        ) : result.ok ? (
          <div className="text-sm space-y-2">
            <div>Job queued: <code>{result.jobId}</code></div>
            <div>Status: <span className="text-blue-600">{result.status}</span></div>
            <div>
              Next: open{" "}
              <a className="underline" href={result.ui}>
                Copilot panel
              </a>{" "}
              and click <em>Run Next Queued Job</em>.
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-600">Error: {result.error}</div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Path: <code>apps/studio/app/ship/work/onboarding/finish/page.tsx</code>
      </div>
    </div>
  );
}