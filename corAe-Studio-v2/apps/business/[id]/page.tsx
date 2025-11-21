// apps/studio/app/business/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function BusinessCompanyViewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [company, setCompany] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const resModules = await fetch(`/api/business/modules?companyId=${id}`);
        const dataModules = await resModules.json();
        setModules(dataModules.modules ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-32">
        <h1 className="text-3xl font-semibold mb-3">Company Overview</h1>
        <p className="text-sm text-zinc-400 mb-8">
          This page shows the modules activated for your company and any linked workflows.
        </p>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 mb-6">
          <div className="text-sm mb-1 text-zinc-400">Company ID</div>
          <div className="text-lg font-medium">{id}</div>
        </div>

        {loading ? (
          <div className="text-sm text-zinc-400">Loading modulesâ€¦</div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-3">Enabled Modules</h2>
            <div className="space-y-2">
              {modules.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 flex justify-between items-center"
                >
                  <div className="text-sm">{m.moduleKey}</div>
                  <div className="text-xs text-zinc-400">
                    {m.enabled ? "âœ… Enabled" : "âŒ Disabled"}
                  </div>
                </div>
              ))}
              {!modules.length && (
                <div className="text-sm text-zinc-500">No modules found for this company.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
