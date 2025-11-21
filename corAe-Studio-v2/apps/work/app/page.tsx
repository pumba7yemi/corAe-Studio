"use client";

import React, { useEffect, useState } from 'react';
import WorkSystemBuilderBadge from '../components/WorkSystemBuilderBadge';
import LifeSystemBuilderBadge from '../../life/components/SystemBuilderBadge';

type OnboardingPayload = {
  slug?: string;
  spheres?: string[];
  system?: any | null;
};

export default function WorkHomePage() {
  const [data, setData] = useState<OnboardingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/onboarding');
        if (!res.ok) {
          setError(`Status ${res.status}`);
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err: any) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const system = data?.system ?? null;

  return (
    <main className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Work OS</h1>
        <div className="flex items-center gap-3">
          <WorkSystemBuilderBadge system={system} />
          <LifeSystemBuilderBadge system={(data && (data as any).lifeSystem) || null} />
        </div>
      </header>

      {loading && <p>Loading workspace...</p>}
      {error && <p className="text-rose-600">Error loading onboarding: {error}</p>}

      {!loading && !data && (
        <section className="mt-6 p-4 border rounded">No onboarding data available yet. Try running the onboarding flow.</section>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="col-span-1 p-4 border rounded">
            <h2 className="font-medium">WorkFocus</h2>
            <p className="mt-2 text-sm">Quick access to your current work priorities and focus modules.</p>
            <div className="mt-4">
              {/* Placeholder: real WorkFocus loader will be implemented by the WorkFocus loader */}
              <div className="text-sm opacity-80">{data?.slug ? `Workspace for ${data.slug}` : 'No user'}</div>
            </div>
          </section>

          <section className="col-span-1 p-4 border rounded">
            <h2 className="font-medium">Have-You</h2>
            <p className="mt-2 text-sm">Generated Have-You checklist and onboarding artifacts.</p>
            <div className="mt-4 text-sm">
              {Array.isArray(data?.spheres) ? (
                <ul className="list-disc ml-5">
                  {data!.spheres!.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              ) : (
                <div className="opacity-70">No spheres created yet.</div>
              )}
            </div>
          </section>

          <section className="col-span-1 p-4 border rounded">
            <h2 className="font-medium">Daily Workflow</h2>
            <p className="mt-2 text-sm">A simple daily plan generated from CAIA scripts.</p>
            <div className="mt-4 text-sm opacity-80">Coming soon — CAIA daily planner will appear here.</div>
          </section>
        </div>
      )}
    </main>
  );
}
