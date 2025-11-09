/* ──────────────────────────────────────────────────────────────
   corAe Home — Storage Utility
   Wrapper for localStorage / sessionStorage with safety guards.
   Used for offline state persistence (e.g., MealPlanner, Wardrobe).
────────────────────────────────────────────────────────────── */

/** Generic safe getter */
export function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Generic safe setter */
export function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota or JSON errors */
  }
}

/** Remove key */
export function clearLocal(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

/** Session variants */
export function getSession<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setSession<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function clearSession(key: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch {}
}