"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page was moved to /work/onboarding/wizard/workfocus.
// Keep a small client-side redirect here so existing links to /wizard/workfocus
// continue to work until callers are updated.

export default function RedirectToShipWorkfocus() {
  const router = useRouter();
  useEffect(() => {
    (router as any).replace("/work/onboarding/wizard/workfocus");
  }, [router]);

  return (
    <div className="p-8 text-center">
      <p className="text-lg">Redirecting to Work Focus wizardâ€¦</p>
    </div>
  );
}

