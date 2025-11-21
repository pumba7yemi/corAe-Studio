"use client";

import React from 'react';

type SystemProps = { system: any | null };

export default function SystemBuilderBadge({ system }: SystemProps) {
  if (!system) {
    return <div className="inline-block px-3 py-1 rounded bg-slate-700 text-slate-200">Life OS: Not initialised</div>;
  }

  if (system.status === 'never-run') {
    return <div className="inline-block px-3 py-1 rounded bg-slate-700 text-slate-200">Life OS: Not initialised</div>;
  }

  if (system.status === 'clarify' || system.status === 'needs-clarification') {
    return <div className="inline-block px-3 py-1 rounded bg-amber-400 text-black">Life OS: Needs clarification — please refine onboarding answers.</div>;
  }

  // green
  const slug = system.personSlug || system.lastBusinessSlug || 'unknown';
  const homeModules = system.homeModules ?? system.lastHomeModules ?? 0;
  const businessModules = system.businessModules ?? system.lastBusinessModules ?? 0;
  return (
    <div className="inline-block px-3 py-1 rounded bg-emerald-600 text-white">Life OS: Ready — {slug} (Home {homeModules}, Business {businessModules})</div>
  );
}
