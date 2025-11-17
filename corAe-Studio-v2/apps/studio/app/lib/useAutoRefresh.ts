"use client";
import { useEffect } from "react";

export function useAutoRefresh(fn: () => void, ms = 3000) {
  useEffect(() => {
    fn(); // initial
    const t = setInterval(fn, ms);
    return () => clearInterval(t);
  }, [fn, ms]);
}
