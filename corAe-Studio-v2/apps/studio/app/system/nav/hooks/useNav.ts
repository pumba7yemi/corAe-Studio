"use client";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { buildNav, buildNavGroups } from "../registry";

export function useNav() {
  const pathname = usePathname();
  const nav = useMemo(() => buildNav(), []);
  const groups = useMemo(() => buildNavGroups(), []);
  const active = nav.find((n) => pathname?.startsWith(n.path));
  return { nav, groups, active, pathname };
}