// apps/studio/src/components/cims/UserSelector.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { CIMSDomain } from "@/app/lib/cims/store";

/** Session/user types mirrored from API */
type UserRole = "owner" | "admin" | "manager" | "agent" | "viewer";
type SessionUser = {
  id: string;
  name: string;
  role: UserRole;
  domains?: CIMSDomain[];
  avatarUrl?: string;
  createdAt?: string;
};

type Variant = "button" | "inline" | "card";

export interface UserSelectorProps {
  /** Visual style */
  variant?: Variant;
  /** Called after a successful switch or clear */
  onChanged?: (user: SessionUser | null) => void;
  /** Disable “Clear” action (hide the button) */
  disableClear?: boolean;
  /** Hide domains text next to role */
  hideDomains?: boolean;
  /** ClassName passthrough for the wrapper */
  className?: string;
}

/** Tiny fetch helper */
async function api<T>(p: string, init?: RequestInit): Promise<T> {
  const r = await fetch(p, { cache: "no-store", ...init });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/**
 * Reusable CIMS User Selector:
 * - Displays current session user.
 * - Lists users from /api/cims/users.
 * - Switches session via POST /api/cims/session.
 * - Optional clear session.
 */
export default function UserSelector({
  variant = "button",
  onChanged,
  disableClear,
  hideDomains,
  className,
}: UserSelectorProps) {
  const [me, setMe] = useState<SessionUser | null>(null);
  const [all, setAll] = useState<SessionUser[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  const loadSession = useCallback(async () => {
    const d = await api<{ ok: boolean; user?: SessionUser }>("/api/cims/sessions");
    const u = (d as any).user ?? (d as any).active ?? null;
    setMe(u);
    onChanged?.(u);
  }, [onChanged]);

  const loadUsers = useCallback(async () => {
    const d = await api<{ ok: boolean; users: SessionUser[] }>("/api/cims/users");
    setAll(d.users ?? []);
  }, []);

  useEffect(() => {
    void loadSession();
    void loadUsers();
  }, [loadSession, loadUsers]);

  async function switchTo(userId: string) {
    if (!userId || busy) return;
    setBusy(true);
    try {
      await api("/api/cims/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      await loadSession();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  async function clearSession() {
    if (busy) return;
    setBusy(true);
    try {
  await api("/api/cims/sessions", { method: "DELETE" });
      await loadSession();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.domains || []).some((d) => d.toLowerCase().includes(q))
    );
  }, [all, filter]);

  const label = me ? `${me.name} • ${me.role}` : "Select a user";

  if (variant === "inline" || variant === "card") {
    return (
      <div
        className={[
          "bg-white border rounded-xl",
          variant === "card" ? "p-4 shadow-sm" : "p-2",
          className || "",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 mb-2">
          <strong className="text-sm">{me ? "Current user" : "No session"}</strong>
          <span className="text-xs text-slate-500">
            {me ? (
              <>
                {me.role}
                {!hideDomains && me.domains?.length ? ` • ${me.domains.join(", ")}` : ""}
              </>
            ) : (
              "—"
            )}
          </span>
          <button
            className="ml-auto px-2 py-1 rounded-lg border text-xs hover:bg-slate-50"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? "Close" : "Switch"}
          </button>
        </div>

        {open && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 border rounded-lg px-2 py-1 text-sm"
                placeholder="Filter by name, role, domain…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              {!disableClear && (
                <button
                  className="px-2 py-1 rounded-lg border text-xs hover:bg-slate-50"
                  onClick={clearSession}
                  disabled={busy}
                >
                  Clear
                </button>
              )}
            </div>

            <ul className="max-h-64 overflow-auto border rounded-lg divide-y">
              {shown.map((u) => (
                <li key={u.id}>
                  <button
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                      me?.id === u.id ? "bg-slate-100/80" : ""
                    }`}
                    onClick={() => switchTo(u.id)}
                    disabled={busy || me?.id === u.id}
                    title={u.id}
                  >
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-slate-500">
                      {u.role}
                      {!hideDomains && u.domains?.length ? ` • ${u.domains.join(", ")}` : ""}
                    </div>
                  </button>
                </li>
              ))}
              {!shown.length && (
                <li className="px-3 py-2 text-sm text-slate-500">No users match.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // variant === "button"
  return (
    <div className={["relative", className || ""].join(" ")}>
      <button
        className="px-3 py-1.5 rounded-full border text-sm hover:bg-slate-50 transition"
        onClick={() => setOpen((v) => !v)}
        title="Current user / switch"
        aria-expanded={open}
      >
        {label}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg z-10">
          <div className="p-2 border-b text-xs text-slate-500">Switch user</div>

          <div className="p-2">
            <input
              className="w-full border rounded-lg px-2 py-1 text-sm"
              placeholder="Filter by name, role, domain…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <ul className="max-h-64 overflow-auto">
            {shown.map((u) => (
              <li key={u.id}>
                <button
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                    me?.id === u.id ? "bg-slate-100/80" : ""
                  }`}
                  onClick={() => switchTo(u.id)}
                  disabled={busy || me?.id === u.id}
                  title={u.id}
                >
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-slate-500">
                    {u.role}
                    {!hideDomains && u.domains?.length ? ` • ${u.domains.join(", ")}` : ""}
                  </div>
                </button>
              </li>
            ))}
            {!shown.length && <li className="px-3 py-2 text-sm text-slate-500">No users.</li>}
          </ul>

          <div className="p-2 border-t flex gap-2">
            {!disableClear && (
              <button
                className="px-3 py-1 rounded-lg border text-sm"
                onClick={clearSession}
                disabled={busy || !me}
              >
                Clear
              </button>
            )}
            <button
              className="px-3 py-1 rounded-lg border text-sm ml-auto"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}