"use client";

export function getParam(name: string, defaultValue: string = ""): string {
  if (typeof window === "undefined") return defaultValue;
  try {
    const v = new URLSearchParams(window.location.search).get(name);
    return v ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export function getBoolParam(name: string, defaultValue = false): boolean {
  if (typeof window === "undefined") return defaultValue;
  try {
    const v = new URLSearchParams(window.location.search).get(name);
    if (v == null) return defaultValue;
    return ["1", "true", "yes", "on"].includes(v.toLowerCase());
  } catch {
    return defaultValue;
  }
}
