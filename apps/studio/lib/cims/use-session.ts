// apps/studio/app/lib/cims/use-session.ts
"use client";

import { useCallback, useEffect, useState } from "react";

export type CIMSDomain = "management" | "hr" | "finance" | "operations" | "marketing";
export type UserRole = "owner" | "admin" | "manager" | "agent" | "viewer";
export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
  domains: CIMSDomain[];
  createdAt: string; // ISO
}

type SessionResponse = { ok: true; user: SessionUser } | { ok: false };

/**
 * Tiny client hook for reading and mutating the current CIMS session
 * via the /api/cims/session endpoints.
 */
export function useCimsSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/cims/sessions", { cache: "no-store" });
      const data = await r.json();
      const user = (data as any).user ?? (data as any).active ?? null;
      if (user) setUser(user as SessionUser);
      else setUser(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/cims/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await r.json();
      const user = (data as any).user ?? (data as any).active ?? null;
      if (user) setUser(user as SessionUser);
      else setUser(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/cims/sessions", { method: "DELETE" });
      setUser(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial fetch on mount
    void refresh();
  }, [refresh]);

  return { user, loading, error, refresh, switchUser, clear };
}
