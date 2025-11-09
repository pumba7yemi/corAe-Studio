"use client";

import { PropsWithChildren, useEffect, useState } from "react";

const KEY = "onboarding:done";

export function OnboardingGate({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState<boolean>(true); // default true so SSR/CSR match

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(KEY);
      setDone(v === "1");
    } catch {
      setDone(true);
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) {
    // keep markup stable during hydration
    return <div className="min-h-[32px]" />;
  }

  if (!done) {
    return (
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Welcome</h2>
        <p className="mt-1 text-sm text-slate-700">
          Let’s get you set up. When you’re ready, tap continue.
        </p>
        <div className="mt-3">
          <button
            className="rounded-xl bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            onClick={() => {
              try { window.localStorage.setItem(KEY, "1"); } catch {}
              setDone(true);
            }}
          >
            Continue
          </button>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}