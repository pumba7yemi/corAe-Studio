"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type BrandCtx = {
  name: string;
  logoText?: string;
  primary: string;
  surface: string;
  text: string;
  muted: string;
  radius: string;
};

const Ctx = createContext<BrandCtx | null>(null);
export const useBrand = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("BrandProvider missing");
  return v;
};

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<BrandCtx | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/brand", { cache: "no-store" });
      const d = await r.json();
      const t = d.brand?.theme;
      if (t) setTheme({
        name: t.name, logoText: t.logoText,
        primary: t.primary, surface: t.surface,
        text: t.text, muted: t.muted, radius: t.radius ?? "12px",
      });
    })();
  }, []);

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", theme.primary);
    root.style.setProperty("--brand-surface", theme.surface);
    root.style.setProperty("--brand-text", theme.text);
    root.style.setProperty("--brand-muted", theme.muted);
    root.style.setProperty("--brand-radius", theme.radius);
  }, [theme]);

  const value = useMemo(() => theme ?? {
    name: "Loading…",
    primary: "#1C7CF5", surface: "#ffffff", text: "#0a0a0a", muted: "#6b7280", radius: "12px",
  }, [theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
