"use client";

import React from 'react';

type WorkSystem = {
  status?: 'never-run' | 'green' | 'clarify' | 'red' | 'error';
  personSlug?: string;
  hasHome?: boolean;
  hasBusiness?: boolean;
  hasLife?: boolean;
  workModules?: number;
  ts?: string;
};

export default function WorkSystemBuilderBadge({ system }: { system: WorkSystem | null }) {
  if (!system || system.status === 'never-run') {
    return (
      <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs opacity-70">
        Work OS: Not initialised
      </div>
    );
  }

  if (system.status === 'green') {
    return (
      <div className="inline-flex items-center rounded-full bg-emerald-600/80 px-3 py-1 text-xs text-white">
        Work OS: Ready{system.personSlug ? ` — ${system.personSlug}` : ''}
        {typeof system.workModules === 'number' && (
          <span className="ml-2 opacity-80">• modules: {system.workModules}</span>
        )}
      </div>
    );
  }

  if (system.status === 'clarify') {
    return (
      <div className="inline-flex items-center rounded-full bg-amber-500/80 px-3 py-1 text-xs text-white">
        Work OS: Needs clarification — refine your onboarding answers.
      </div>
    );
  }

  return (
    <div className="inline-flex items-center rounded-full bg-rose-600/80 px-3 py-1 text-xs text-white">
      Work OS: Build error — contact CAIA.
    </div>
  );
}
