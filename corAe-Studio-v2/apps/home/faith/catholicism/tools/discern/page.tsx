"use client";
import React from "react";

export default function Page() {
  // Minimal client-side placeholder. The optional interactive Discern tools are
  // provided by an external package which may not be installed in every ship.
  // We intentionally avoid importing that package here at build time to keep
  // the Studio build resilient.
  return (
    <div className="prose max-w-3xl mx-auto py-8">
      <h1>Discern</h1>
      <p className="text-sm opacity-80">Private. Local by default. Confession recommended for mortal findings.</p>
      <div className="mt-6">
        <div className="rounded-lg border p-4 text-sm text-neutral-600">
          Discern tools are not available in this build. To enable interactive discernment,
          install the optional package <code>@corae/faith-discern</code> or provide a client-side
          integration that exposes a <code>DiscernForm</code> component.
        </div>
      </div>
    </div>
  );
}
