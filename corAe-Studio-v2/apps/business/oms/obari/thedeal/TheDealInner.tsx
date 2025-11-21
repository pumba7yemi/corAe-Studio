"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ConfirmPricelock from "./ConfirmPricelock";

type DealStatus = {
  id: string;
  pricelockConfirmed: boolean;
  slaBound?: boolean;
};

export default function TheDealInner() {
  const qp = useSearchParams();
  const dealId = qp?.get("dealId") ?? "";
  const router = useRouter();
  const [status, setStatus] = useState<DealStatus | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let stop = false;
    if (!dealId) return;
    (async () => {
      try {
        const res = await fetch(`/api/oms/obari/thedeal/status?dealId=${dealId}`, { cache: "no-store" });
        const j = await res.json();
        if (!stop) setStatus(j);
      } catch {}
      finally { if (!stop) setChecking(false); }
    })();
    return () => { stop = true; };
  }, [dealId]);

  // Auto-redirect guard
  useEffect(() => {
    if (!status || checking) return;
    if (status.pricelockConfirmed && !status.slaBound) {
      (router as any).replace(`/business/oms/obari/thedeal/sla-escalation?dealId=${dealId}`);
    }
  }, [status, checking, router, dealId]);

  if (checking) {
    return <main className="p-6 text-zinc-400">Checking deal statusâ€¦</main>;
  }

  if (status?.pricelockConfirmed && status?.slaBound) {
    return (
      <main className="p-6 text-zinc-100">
        <h1 className="text-xl font-semibold">SLA Bound</h1>
        <p className="text-sm text-zinc-400">This dealâ€™s SLA is already attached and active.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6 text-zinc-100">
      <h1 className="mb-2 text-2xl font-semibold">OBARI â†’ TheDeal</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Here you finalize the Pricelock before the SLA attach phase.
      </p>

      {dealId ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="mb-2 text-lg font-semibold">Pricelock Chain</h2>
          <p className="mb-3 text-sm text-zinc-400">
            Confirm the dealâ€™s final price terms. Once confirmed, youâ€™ll be routed to SLA setup.
          </p>
          <ConfirmPricelock dealId={dealId} />
        </section>
      ) : (
        <div className="text-red-400">Missing dealId in URL</div>
      )}
    </main>
  );
}

