"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Tab = { path: string; title: string };
type Ctx = {
  tabs: Tab[];
  active: string;
  open: (t: Tab) => void;
  close: (path: string) => void;
  closeOthers: (path: string) => void;
  closeAll: () => void;
  activate: (path: string) => void;
};
const TabCtx = createContext<Ctx | null>(null);
export const useTabs = () => useContext(TabCtx)!;

const TITLE_MAP: Record<string, string> = {
  "/": "Home",
  "/pulse": "Pulse",
  "/caia": "CAIA",
  "/cims": "CIMS",
  "/ship": "corAeShip",
  "/schema-builder": "Studio / Schema",
  "/dockyard": "Dockyard",
  "/shipyard": "Shipyard",
};

function titleFor(path: string) {
  const base = Object.keys(TITLE_MAP).find((k) => path === k || path.startsWith(k + "/"));
  return TITLE_MAP[base ?? path] ?? path.split("/").filter(Boolean).map(s => s[0]?.toUpperCase() + s.slice(1)).join(" · ");
}

export default function TabMemoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [tabs, setTabs] = useState<Tab[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("corae.tabs");
      return raw ? (JSON.parse(raw) as Tab[]) : [];
    } catch { return []; }
  });
  const [active, setActive] = useState<string>(pathname ?? "");
  const lastPath = useRef<string>("");

  // persist
  useEffect(() => {
    localStorage.setItem("corae.tabs", JSON.stringify(tabs));
  }, [tabs]);

  // open/activate on navigation
  useEffect(() => {
  if (!pathname || pathname === lastPath.current) return;
  lastPath.current = pathname;
  const p = pathname ?? "";
  const t: Tab = { path: p, title: titleFor(p) };
    setTabs(prev => {
      // already open?
      if (prev.some(p => p.path === t.path)) return prev;
      const next = [...prev, t];
      return next.slice(-12); // cap
    });
    setActive(pathname ?? "");
  }, [pathname]);

  // keyboard Ctrl+Tab
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.key.toLowerCase() !== "tab") return;
      e.preventDefault();
      if (tabs.length < 2) return;
      const idx = tabs.findIndex(t => t.path === active);
      const next = tabs[(idx + 1) % tabs.length].path;
      router.push(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tabs, active, router]);

  const api = useMemo<Ctx>(() => ({
    tabs, active,
    open: (t) => { setTabs(prev => (prev.some(p => p.path === t.path) ? prev : [...prev, t].slice(-12))); setActive(t.path); },
    close: (path) => {
      setTabs(prev => {
        const idx = prev.findIndex(p => p.path === path);
        if (idx === -1) return prev;
        const next = prev.filter(p => p.path !== path);
        if (path === active && next.length) {
          const fallback = next[Math.max(0, idx - 1)].path;
          router.push(fallback);
        }
        return next;
      });
    },
    closeOthers: (path) => setTabs(prev => prev.filter(p => p.path === path)),
    closeAll: () => { setTabs([]); router.push("/"); },
    activate: (path) => { setActive(path); router.push(path); },
  }), [tabs, active, router]);

  return <TabCtx.Provider value={api}>{children}</TabCtx.Provider>;
}