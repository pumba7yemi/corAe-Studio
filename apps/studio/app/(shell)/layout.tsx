/* corAe Studio — AppShell layout (nested)
   Renders a left sidebar + top HealthStrip.
   NOTE: This is a nested layout under "(shell)". It wraps any pages inside that folder. */

import * as React from "react";
import type { ReactNode } from "react";

const HealthStrip = function HealthStrip() {
  // lightweight local stub of the HealthStrip UI so the layout compiles
  return React.createElement(
    "div",
    {
      "aria-hidden": true,
      style: {
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        height: 6,
        background: "linear-gradient(90deg,#16a34a,#06b6d4)",
        zIndex: 9998,
      },
    }
  );
};

/* Local lightweight stub for ShellNav to avoid missing-module errors in this nested layout. */
const ShellNav: React.FC = () => {
  return (
    <nav aria-label="Shell navigation" className="w-64 flex-shrink-0">
      <div
        aria-hidden
        className="h-full px-2 py-4 bg-white/50 dark:bg-neutral-900/30 rounded"
        style={{ minWidth: 200 }}
      >
        ShellNav
      </div>
    </nav>
  );
};

export const metadata = {
  title: "corAe Studio — Shell",
  description: "Studio shell with health overlay",
};

// Use an env var to control demo mode; set NEXT_PUBLIC_DEMO=1 to enable.
const isDemo = (): boolean => {
  return process.env.NEXT_PUBLIC_DEMO === "1";
};

// Keep layout dynamic if needed by the app
export const dynamic = "force-dynamic";

export default function ShellLayout({ children }: { children: ReactNode }) {
  const demo = isDemo();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100"
        style={{ position: "relative" }}
      >
        <HealthStrip />
        <div className="mx-auto flex max-w-7xl gap-6 px-3 py-4">
          <ShellNav />
          <main className="min-w-0 flex-1">{children}</main>
        </div>

        {demo && (
          <div
            aria-hidden={false}
            style={{
              position: "fixed",
              right: 12,
              top: 12,
              zIndex: 9999,
              background: "#fefce8",
              color: "#92400e",
              padding: "6px 10px",
              borderRadius: 999,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            Demo ON
          </div>
        )}
      </body>
    </html>
  );
}
