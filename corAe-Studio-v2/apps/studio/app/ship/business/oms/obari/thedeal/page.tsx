"use client";
export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import TheDealInner from "./TheDealInner";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <TheDealInner />
    </Suspense>
  );
}