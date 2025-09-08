'use client';

export default function DockyardHome() {
  return (
    <main className="flex flex-col gap-6 max-w-5xl mx-auto p-8">
      <header>
        <h1 className="text-4xl font-bold">⚓ Dockyard — corAe Studio</h1>
        <p className="text-gray-600 mt-2">Admin-only tools: Build Log, Theme Engine, Dev Agent.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <a href="/dockyard/build/log" className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition">
          <h2 className="text-xl font-semibold">📜 Build Log</h2>
          <p className="text-sm text-gray-600 mt-2">Append-only One-Build timeline.</p>
        </a>

        <a href="/dockyard/theme" className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition">
          <h2 className="text-xl font-semibold">🎨 Theme Engine</h2>
          <p className="text-sm text-gray-600 mt-2">Set active white-label brand preset.</p>
        </a>

        <a href="/dockyard/dev-agent" className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition">
          <h2 className="text-xl font-semibold">🤖 Dev Agent</h2>
          <p className="text-sm text-gray-600 mt-2">Automation hooks (coming soon).</p>
        </a>
      </section>
    </main>
  );
}