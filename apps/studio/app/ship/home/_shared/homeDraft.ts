"use client";

export type HomeDraft = Record<string, any>;
const LOCAL_KEY = "corAeHomeWizard/homefocus";

export function loadDraft<T = HomeDraft>(): T {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch {
    return {} as T;
  }
}

export function saveDraft<T = HomeDraft>(updater: (prev: T) => T): T {
  const prev = loadDraft<T>();
  const next = updater(prev);
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch {}
  return next;
}
