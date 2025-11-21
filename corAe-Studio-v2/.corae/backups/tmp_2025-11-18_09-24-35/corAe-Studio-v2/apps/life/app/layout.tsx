import type { ReactNode } from "react";
import "./globals.css";
import { currentHealthSummary } from "../lib/caiaHealth";

export const metadata = {
  title: "corAe Life OS",
  description: "Life corridor for Home, Work, and Business"
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const summary = await currentHealthSummary();

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <header className="w-full py-3 px-4 bg-slate-900 border-b border-slate-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="text-sm text-slate-300">You</div>
            <div className="text-sm text-slate-300">CAIA</div>
            <div className="text-sm font-semibold">
              {summary?.mode ?? 'UNKNOWN'} • {summary?.score ?? 0}
            </div>
          </div>
        </header>
        <main className="min-h-screen flex items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}