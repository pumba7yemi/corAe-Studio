'use client';

export default function ShipHome() {
  return (
    <main className="flex flex-col gap-6 max-w-5xl mx-auto p-8">
      <header>
        <h1 className="text-4xl font-bold">🚢 Ship — corAe</h1>
        <p className="text-gray-600 mt-2">This is the product surface that white-labels receive.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <a href="/ship/business" className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition">
          <h2 className="text-xl font-semibold">🏢 Business</h2>
          <p className="text-sm text-gray-600 mt-2">Ops, sales, inventory, POS.</p>
        </a>

        <a href="/ship/work" className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition">
          <h2 className="text-xl font-semibold">💼 Work</h2>
          <p className="text-sm text-gray-600 mt-2">Tasks, projects, time.</p>
        </a>

        <a href="/ship/home" className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition">
          <h2 className="text-xl font-semibold">🏠 Home</h2>
          <p className="text-sm text-gray-600 mt-2">Personal hub.</p>
        </a>

        <a href="/ship/caia" className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition">
          <h2 className="text-xl font-semibold">🧠 CAIA</h2>
          <p className="text-sm text-gray-600 mt-2">Copy with system base (just-born memory).</p>
        </a>

        <a href="/ship/3cuDTD" className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition">
          <h2 className="text-xl font-semibold">🧱 3cuDTD</h2>
          <p className="text-sm text-gray-600 mt-2">Data → Design → Deploy tri-cube.</p>
        </a>
      </section>

      <footer className="text-sm text-gray-500">
        Not a Studio page. Studio tools live at <a className="underline" href="/dockyard">/dockyard</a>.
      </footer>
    </main>
  );
}