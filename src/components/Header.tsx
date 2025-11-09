"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/* ───────────────────────────────
   Types
─────────────────────────────── */
type User = { id: string; name: string; role: string };
type DropItem = { label: string; href: string };

/* ───────────────────────────────
   Digital Clock (left)
─────────────────────────────── */
function DigitalClock() {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const timeStr = now.toLocaleTimeString(undefined, { hour12: false }).replace(/\s/g, "");
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
   Calm Dropdown
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
              const active = activePrefix === it.href || activePrefix.startsWith(it.href + "/");
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={`block px-4 py-2 text-sm ${
                      active ? "text-sky-300" : "text-slate-200 hover:text-sky-200"
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
   Header (center cluster + right utilities)
─────────────────────────────── */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // CIMS users (right side)
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userRef = useRef<HTMLDivElement | null>(null);

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

  // Menus
  const coraeMenu: DropItem[] = useMemo(
    () => [
      { label: "Supermarket", href: "/apps/supermarket" },
      { label: "Gym", href: "/apps/gym" },
      { label: "Salon", href: "/apps/salon" },
      { label: "Property", href: "/apps/property" },
    ],
    []
  );
  const caiaMenu: DropItem[] = useMemo(
    () => [
      { label: "Pulse", href: "/pulse" },
      { label: "CIMS", href: "/cims" },
      { label: "3³ DTD", href: "/dtd" },
    ],
    []
  );
  const studioMenu: DropItem[] = useMemo(
    () => [
      { label: "Ship", href: "/ship" },
      { label: "Dockyard", href: "/dockyard" },
      { label: "Shipyard", href: "/shipyard" },
    ],
    []
  );
  const lifeMenu: DropItem[] = useMemo(
    () => [
      { label: "Business", href: "/ship/business" },
      { label: "Work", href: "/ship/work" },
      { label: "Home", href: "/ship/home" },
    ],
    []
  );

  return (
    <header className="sticky top-0 z-50 bg-slate-800/95 border-b border-slate-700 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left */}
        <DigitalClock />

        {/* Center cluster — double-spaced */}
        <div className="flex items-center justify-center gap-8 sm:gap-10">
          <Dropdown
            trigger={
              <span className="text-sm font-semibold text-gray-300 hover:text-blue-300">
                {"cor"}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-500 font-bold">
                  {"A"}
                </span>
                {"e"}
              </span>
            }
            items={coraeMenu}
            activePrefix={pathname ?? ""}
          />
          <Dropdown
            trigger={
              <span className="flex items-center gap-2">
                <span className="relative">
                  <span className="absolute inline-flex h-5 w-5 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-5 w-5 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.9)]" />
                </span>
                <span className="text-emerald-300 font-extrabold text-xl tracking-wide select-none">CAIA</span>
              </span>
            }
            items={caiaMenu}
            activePrefix={pathname ?? ""}
          />
          <Dropdown
            trigger={
              <span className="text-sm font-semibold text-gray-300 hover:text-blue-300">
                Life<sup className="ml-0.5 text-[0.6em] leading-none tracking-tight align-super">os</sup>
                <span className="ml-1">™</span>
              </span>
            }
            items={lifeMenu}
            activePrefix={pathname ?? ""}
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          <Dropdown
            trigger={<span className="text-sm font-semibold text-gray-300 hover:text-blue-300">Studio</span>}
            items={studioMenu}
            activePrefix={pathname ?? ""}
            align="right"
          />

          <div ref={userRef} className="relative">
            <button
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg text-xs"
              onClick={() => setUserMenuOpen((s) => !s)}
            >
              {busy ? "Switching…" : activeUser ? `${activeUser.name} (${activeUser.role})` : "No Session"}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-700 bg-slate-800/95 shadow-xl backdrop-blur">
                <div className="px-3 py-2 border-b border-slate-700">
                  <div className="text-xs text-slate-400">CIMS Session</div>
                  <div className="text-sm text-slate-200">{activeUser ? activeUser.name : "—"}</div>
                </div>
                <ul className="max-h-64 overflow-auto py-1">
                  {users.map((u) => {
                    const isActive = activeUser?.id === u.id;
                    return (
                      <li key={u.id}>
                        <button
                          disabled={isActive || busy}
                          onClick={() => switchUser(u.id)}
                          className={`w-full text-left px-3 py-2 text-sm ${
                            isActive
                              ? "text-emerald-300"
                              : "text-slate-200 hover:text-sky-200 hover:bg-slate-700/50"
                          } disabled:opacity-60`}
                        >
                          {u.name} <span className="text-xs text-slate-400">({u.role})</span>
                        </button>
                      </li>
                    );
                  })}
                  {!users.length && <li className="px-3 py-2 text-sm text-slate-400">No users available</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}