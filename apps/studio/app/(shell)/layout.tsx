/* corAe Studio — AppShell layout (nested)
   Renders a left sidebar + top HealthStrip.
   NOTE: This is a nested layout under "(shell)". It wraps any pages inside that folder. */

import type { ReactNode } from "react";
import HealthStrip from "@/app/components/HealthStrip";
import ShellNav from "@/app/components/ShellNav";

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
