"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { ShoppingCart, Wallet, LineChart, Users, Settings, Activity } from "lucide-react";

/** corAe Dock Bar — fixed bottom module launcher */
export default function DockBar() {
  const pathname = usePathname();
  const router = useRouter();

  const modules = useMemo(
    () => [
      { name: "POS", icon: ShoppingCart, href: "/pos" },
      { name: "Accounts", icon: Wallet, href: "/accounts" },
      { name: "Marketing", icon: LineChart, href: "/marketing" },
      { name: "HR", icon: Users, href: "/hr" },
      { name: "Operations", icon: Settings, href: "/operations" },
      { name: "Pulse", icon: Activity, href: "/pulse" },
    ],
    []
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-700 backdrop-blur-lg">
      <div className="flex justify-center gap-6 sm:gap-8 py-2">
        {modules.map((m) => {
          const active = pathname?.startsWith(m.href) ?? false;
          const Icon = m.icon;
          return (
            <button
              key={m.href}
              onClick={() => router.push(m.href)}
              title={m.name}
              className={`flex flex-col items-center justify-center text-xs font-medium transition-all ${
                active ? "text-sky-400" : "text-slate-400 hover:text-sky-300 hover:scale-110"
              }`}
            >
              <Icon size={22} strokeWidth={2} className={`mb-1 ${active ? "drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]" : ""}`} />
              {m.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}