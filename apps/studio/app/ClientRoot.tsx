// apps/studio/app/ClientRoot.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

/* ───────────────────────────────
   Types
─────────────────────────────── */
type User = { id: string; name: string; role: string };
type Tab = { path: string; title: string };
type DropItem = { label: string; href: string };

/* ───────────────────────────────
   Utils
─────────────────────────────── */
function titleFor(path: string): string {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/") return "Home";
  const parts = clean.split("/").filter(Boolean);
  return parts
    .map((p) =>
      p.toLowerCase() === "dtd"
        ? "3³ DTD"
        : p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    )
    .join(" / ");
}

function addTab(
  setter: React.Dispatch<React.SetStateAction<Tab[]>>,
  path: string,
  title?: string
) {
  setter((prev) => {
    if (prev.some((t) => t.path === path)) return prev;
    const next = [...prev, { path, title: title || titleFor(path) }];
    return next.slice(-20);
  });
}
function removeTab(
  setter: React.Dispatch<React.SetStateAction<Tab[]>>,
  path: string
) {
  setter((prev) => prev.filter((t) => t.path !== path));
}

/* ───────────────────────────────
   Digital Clock (server-safe date, live time)
─────────────────────────────── */
function DigitalClock() {
  const dateStr = useMemo(() => {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date());
  }, []);

  const [timeStr, setTimeStr] = useState("--:--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const tick = () => setTimeStr(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden sm:flex items-center gap-3 select-none">
      <span className="text-xs text-slate-400">{dateStr}</span>
      <span className="font-mono text-[13px] tracking-wider text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.55)]">
        {timeStr}
      </span>
    </div>
  );
}

/* ───────────────────────────────
   Calm Click Dropdown
─────────────────────────────── */
function Dropdown({
  trigger,
  items,
  activePrefix,
  onPick,
  align = "left",
}: {
  trigger: React.ReactNode;
  items: DropItem[];
  activePrefix: string;
  onPick?: (item: DropItem) => void;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        className="inline-flex items-center gap-1 px-1 py-1 rounded-md focus:ring-2 focus:ring-sky-500"
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
        <span className="text-xs text-slate-400">▾</span>
      </button>
      {open && (
        <div
          className={`absolute top-full mt-2 w-48 rounded-lg border border-slate-700 bg-slate-800/95 shadow-lg backdrop-blur z-50 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <ul className="py-1">
            {items.map((it) => {
              const active =
                activePrefix === it.href ||
                activePrefix.startsWith(it.href + "/");
              return (
                <li key={it.href}>
                  <Link
                    href={it.href as any}
                    className={`block px-4 py-2 text-sm ${
                      active
                        ? "text-sky-300"
                        : "text-slate-200 hover:text-sky-200"
                    } hover:bg-slate-700/40`}
                    onClick={() => {
                      onPick?.(it);
                      setOpen(false);
                    }}
                  >
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────
   ClientRoot — your original layout UI
─────────────────────────────── */
export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [tabs, setTabs] = useState<Tab[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("corae.tabs") || "[]");
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState(pathname);
  const lastPath = useRef("");

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;
    addTab(setTabs, pathname, titleFor(pathname));
    setActiveTab(pathname);
  }, [pathname]);
  useEffect(() => {
    if (mounted) localStorage.setItem("corae.tabs", JSON.stringify(tabs));
  }, [tabs, mounted]);

  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userRef = useRef<HTMLDivElement | null>(null);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/cims/users", { cache: "no-store" });
        const d = await r.json();
        setUsers(d.users || []);
        setActiveUser(d.active || null);
      } catch {}
    })();
  }, []);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!userRef.current) return;
      if (!userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const switchUser = async (id: string) => {
    try {
      setBusy(true);
      await fetch("/api/cims/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ switchId: id }),
      });
      const r = await fetch("/api/cims/users", { cache: "no-store" });
      const d = await r.json();
      setUsers(d.users || []);
      setActiveUser(d.active || null);
    } finally {
      setBusy(false);
      setUserMenuOpen(false);
    }
  };

  const coraeMenu: DropItem[] = [
    { label: "Supermarket", href: "/apps/supermarket" },
    { label: "Gym", href: "/apps/gym" },
    { label: "Salon", href: "/apps/salon" },
    { label: "Property", href: "/apps/property" },
  ];
  const caiaMenu: DropItem[] = [
    { label: "Pulse", href: "/pulse" },
    { label: "CIMS", href: "/cims" },
    { label: "3³ DTD", href: "/dtd" },
  ];
  const lifeMenu: DropItem[] = [
    { label: "Business", href: "/ship/business" },
    { label: "Work", href: "/ship/work" },
    { label: "Home", href: "/ship/home" },
  ];
  const studioMenu: DropItem[] = [
    { label: "Ship", href: "/ship" },
    { label: "Dockyard", href: "/dockyard" },
    { label: "Shipyard", href: "/shipyard" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-800/95 border-b border-slate-700 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left: Clock */}
          <DigitalClock />

          {/* Center cluster — corAe   CAIA   Lifeᵒˢ™ */}
          <div className="flex items-center justify-center gap-8 sm:gap-10">
            <Dropdown
              trigger={
                <span className="text-sm font-semibold text-gray-300 hover:text-blue-300">
                  {"cor"}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 via-emerald-400 to-sky-500 font-bold">
                    {"A"}
                  </span>
                  {"e"}
                </span>
              }
              items={coraeMenu}
              activePrefix={pathname ?? ""}
              onPick={(i) => addTab(setTabs, i.href, `corAe ${i.label}`)}
            />

            <Dropdown
              trigger={
                <span className="flex items-center gap-2">
                  <span className="relative">
                    <span className="absolute inline-flex h-5 w-5 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-5 w-5 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.9)]" />
                  </span>
                  <span className="text-emerald-300 font-extrabold text-xl tracking-wide select-none">
                    CAIA
                  </span>
                </span>
              }
              items={caiaMenu}
              activePrefix={pathname ?? ""}
              onPick={(i) => addTab(setTabs, i.href, `CAIA ${i.label}`)}
            />

            <Dropdown
              trigger={
                <span className="text-sm font-semibold text-gray-300 hover:text-blue-300">
                  Life
                  <sup className="ml-0.5 text-[0.6em] leading-none tracking-tight align-super">
                    os
                  </sup>
                  <span className="ml-1">™</span>
                </span>
              }
              items={lifeMenu}
              activePrefix={pathname ?? ""}
              onPick={(i) => addTab(setTabs, i.href, `Lifeos ${i.label}`)}
            />
          </div>

          {/* Right: Studio + User */}
          <div className="flex items-center gap-6">
            <Dropdown
              trigger={
                <span className="text-sm font-semibold text-gray-300 hover:text-blue-300">
                  Studio
                </span>
              }
              items={studioMenu}
              activePrefix={pathname ?? ""}
              onPick={(i) => addTab(setTabs, i.href, `Studio ${i.label}`)}
              align="right"
            />

            <div ref={userRef} className="relative">
              <button
                className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg text-xs"
                onClick={() => setUserMenuOpen((s) => !s)}
              >
                {busy
                  ? "Switching…"
                  : activeUser
                  ? `${activeUser.name} (${activeUser.role})`
                  : "No Session"}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-700 bg-slate-800/95 shadow-xl backdrop-blur">
                  <div className="px-3 py-2 border-b border-slate-700">
                    <div className="text-xs text-slate-400">CIMS Session</div>
                    <div className="text-sm text-slate-200">
                      {activeUser ? activeUser.name : "—"}
                    </div>
                  </div>
                  <ul className="max-h-64 overflow-auto py-1">
                    {users.map((u) => (
                      <li key={u.id}>
                        <button
                          disabled={activeUser?.id === u.id || busy}
                          onClick={() => switchUser(u.id)}
                          className={`w-full text-left px-3 py-2 text-sm ${
                            activeUser?.id === u.id
                              ? "text-emerald-300"
                              : "text-slate-200 hover:text-sky-200 hover:bg-slate-700/50"
                          }`}
                        >
                          {u.name}{" "}
                          <span className="text-xs text-slate-400">
                            ({u.role})
                          </span>
                        </button>
                      </li>
                    ))}
                    {!users.length && (
                      <li className="px-3 py-2 text-sm text-slate-400">
                        No users available
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab strip (hydration-safe) */}
        <div className="px-2 pb-2">
          <TabsStrip
            pathname={pathname ?? "/"}
            tabs={tabs}
            onClose={(path) => {
              const active = pathname === path;
              const idx = tabs.findIndex((x) => x.path === path);
              removeTab(setTabs, path);
              if (active) {
                const neighbor = tabs[idx + 1]?.path ?? tabs[idx - 1]?.path ?? "/";
                router.push(neighbor as any);
              }
            }}
          />
        </div>
      </header>

      <main className="px-3 sm:px-6 py-4">{children}</main>
    </>
  );
}

/* ───────────────────────────────
   Tabs strip (extracted for clarity)
─────────────────────────────── */
function TabsStrip({
  pathname,
  tabs,
  onClose,
}: {
  pathname: string;
  tabs: Tab[];
  onClose: (path: string) => void;
}) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return <div className="h-8" />;

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
      {tabs.map((t) => {
        const active = pathname === t.path;
        return (
          <div
            key={t.path}
            className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              active
                ? "border-sky-500 bg-sky-500/10"
                : "border-slate-700 bg-slate-800/60 hover:bg-slate-700/60"
            }`}
          >
            <Link
              href={t.path as any}
              className={`text-xs whitespace-nowrap ${
                active ? "text-sky-200" : "text-slate-200"
              }`}
            >
              {t.title}
            </Link>
            <button
              aria-label={`Close ${t.title}`}
              className={`text-[10px] px-1 rounded hover:bg-slate-600/60 ${
                active ? "text-sky-300" : "text-slate-400"
              }`}
              onClick={() => onClose(t.path)}
            >
              ×
            </button>
          </div>
        );
      })}
      {!tabs.length && (
        <span className="text-xs text-slate-500 px-2">
          Tabs appear as you navigate.
        </span>
      )}
    </div>
  );
}