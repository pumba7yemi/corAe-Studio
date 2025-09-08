'use client';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-4">🚀 corAe Studio</h1>
      <p className="text-lg text-gray-700 mb-8">
        Welcome to your corAe One-Build environment.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="/build/log"
          className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition"
        >
          <h2 className="text-xl font-semibold">📜 Build Log →</h2>
          <p className="text-sm text-gray-600 mt-2">
            View append-only log of One-Build actions.
          </p>
        </a>

        <a
          href="/api/theme/apply"
          className="rounded-2xl border shadow p-6 hover:bg-gray-100 transition"
        >
          <h2 className="text-xl font-semibold">🎨 Theme Engine →</h2>
          <p className="text-sm text-gray-600 mt-2">
            Apply and fetch white-label brand presets.
          </p>
        </a>
      </div>
    </main>
  );
}