"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Minimal legacy redirect page. Keep this tiny so inbound links continue to work
// without duplicating the canonical implementation under /ship.
export default function RedirectToFirstTrade() {
  const router = useRouter();
  useEffect(() => {
    (router as any).replace("/ship/business/oms/onboarding/wizard/first-trade");
  }, [router]);

  return (
    <div className="p-8 text-center">
      <p className="text-lg">Redirecting to First-Trade wizard…</p>
    </div>
  );
}