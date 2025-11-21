"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [url, setUrl] = useState("http://localhost:3500");

  useEffect(() => {
    const env = process.env.NEXT_PUBLIC_SHIPYARD_URL;
    if (env) setUrl(env);
  }, []);

  return (
    <main className="flex flex-col h-screen bg-black text-white">
      <header className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">⚙️ corAe Shipyard</h1>
          <p className="text-sm text-slate-400">
            Live builds, prototypes & white-label deployments — directly inside Studio.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
          >
            🔄 Refresh
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            🪐 Open Full View (3500)
          </a>
        </div>
      </header>

      <section className="flex-1">
        <iframe
          src={url}
          className="w-full h-full border-0"
          title="Shipyard Live"
        />
      </section>
    </main>
  );
}
