export const isBrowser = () => typeof window !== "undefined";

export function getLocal<T>(k: string, d: T): T {
  if (!isBrowser()) return d;
  try {
    const v = window.localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
}

export function setLocal<T>(k: string, v: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}
