export default function ShipHome() {
  return (
    <main className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">corAe Dashboard</h1>
      <p className="text-neutral-500">Choose where to go:</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <a href="/business" className="c-card">
          <h2 className="text-xl font-semibold">Business</h2>
          <p>POS, Finance, Vendors.</p>
        </a>

        <a href="/work" className="c-card">
          <h2 className="text-xl font-semibold">Work</h2>
          <p>Tasks, Automations, CIMS.</p>
        </a>

        <a href="/home" className="c-card">
          <h2 className="text-xl font-semibold">Home</h2>
          <p>Faith, routines, family.</p>
        </a>
      </div>
    </main>
  );
}