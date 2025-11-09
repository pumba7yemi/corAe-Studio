import React from 'react';
import DotNav from '../../../components/DotNav';
import { LANDING, type LandingPage } from '../../landingConfig';
import { notFound } from 'next/navigation';

type Props = { params: any };

function renderPulse(area: string) {
  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div className="col-span-2 space-y-4">
        <div className="rounded-lg border p-4 bg-white/60 dark:bg-neutral-900/60">
          <h2 className="text-xl font-semibold">Live Pulse</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Quick health and sync status for {area}.</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 rounded border text-center">
              <div className="text-2xl font-bold">98%</div>
              <div className="text-xs text-neutral-500">Uptime</div>
            </div>
            <div className="p-3 rounded border text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-neutral-500">Active items</div>
            </div>
            <div className="p-3 rounded border text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs text-neutral-500">Alerts</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-white/60 dark:bg-neutral-900/60">
          <h3 className="font-medium">Recent activity</h3>
          <ul className="mt-2 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <li>• {area} sync completed 2m ago</li>
            <li>• 4 new leads added</li>
            <li>• 1 workflow error flagged</li>
          </ul>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border p-4 bg-white/60 dark:bg-neutral-900/60">
          <h4 className="font-medium">Shortcuts</h4>
          <div className="mt-3 flex flex-col gap-2">
            <a className="rounded px-3 py-2 bg-sky-50 text-sky-700 text-sm" href="#">Open {area} dashboard</a>
            <a className="rounded px-3 py-2 bg-emerald-50 text-emerald-700 text-sm" href="#">Create new item</a>
          </div>
        </div>
      </aside>
    </section>
  );
}

function renderMain(area: string, page: LandingPage) {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border p-6 bg-white/60 dark:bg-neutral-900/60">
        <h2 className="text-2xl font-semibold">{page.title}</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">{page.description}</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded p-4 border">Main content area — widgets and charts go here.</div>
          <div className="rounded p-4 border">Secondary content — lists, tasks, or feeds.</div>
        </div>
      </div>
    </section>
  );
}

function renderExtra(area: string) {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border p-6 bg-white/60 dark:bg-neutral-900/60">
        <h2 className="text-2xl font-semibold">Explore features</h2>
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <li className="p-3 rounded border">Feature A — short blurb</li>
          <li className="p-3 rounded border">Feature B — short blurb</li>
          <li className="p-3 rounded border">Feature C — short blurb</li>
        </ul>
      </div>
    </section>
  );
}

export default async function LandingPage({ params }: Props) {
  // In modern Next versions `params` may be an async proxy — await it
  // before using its properties to avoid runtime warnings.
  const { area, page } = await params;
  const pages = LANDING[area];
  if (!pages) return notFound();

  const current = pages.find((p: LandingPage) => p.slug === page);
  if (!current) return notFound();

  // pick content by slug
  let content: React.ReactNode = (
    <article className="prose dark:prose-invert">
      <p>
        This is the <strong>{current.title}</strong> landing page for <em>{area}</em>. Use the dots below to
        navigate between pages for this area.
      </p>
    </article>
  );

  if (current.slug === 'pulse') content = renderPulse(area);
  else if (current.slug === 'main') content = renderMain(area, current);
  else if (current.slug === 'extra') content = renderExtra(area);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">{current.title}</h1>
        {current.description ? (
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">{current.description}</p>
        ) : null}
      </header>

      <section className="space-y-6">{content}</section>

      <DotNav area={area} pages={pages} />
    </main>
  );
}