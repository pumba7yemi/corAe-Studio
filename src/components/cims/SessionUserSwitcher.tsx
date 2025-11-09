// apps/studio/src/components/cims/SessionUserSwitcher.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";

type CIMSDomain = "management" | "hr" | "finance" | "operations" | "marketing";
type UserRole = "owner" | "admin" | "manager" | "agent" | "viewer";

type SessionUser = {
  id: string;
  name: string;
  role: UserRole;
  domains?: CIMSDomain[];
  avatarUrl?: string;
  createdAt?: string;
};

async function api<T>(p: string, init?: RequestInit): Promise<T> {
  const r = await fetch(p, init);
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return r.json();
}

export function SessionUserSwitcher() {
  const [me, setMe] = useState<SessionUser | null>(null);
  const [all, setAll] = useState<SessionUser[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadSession = useCallback(async () => {
    const d = await api<{ ok: boolean; user?: SessionUser }>("/api/cims/sessions");
    // sessions route returns { ok, active, users } — keep backwards-compatible shape
    // prefer .user if present, otherwise use .active
    // (some callers expect { user })
    // normalize: accept both { user } and { active }
    const user = (d as any).user ?? (d as any).active ?? null;
    setMe(user);
  }, []);

  const loadUsers = useCallback(async () => {
    const d = await api<{ ok: boolean; users: SessionUser[] }>("/api/cims/users");
    setAll(d.users || []);
  }, []);

  useEffect(() => {
    loadSession();
    loadUsers();
  }, [loadSession, loadUsers]);

  async function switchTo(userId: string) {
    if (!userId || busy) return;
    setBusy(true);
    try {
      await fetch("/api/cims/sessions", {
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
  await fetch("/api/cims/sessions", { method: "DELETE" });
      await loadSession();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  const label = me ? `${me.name} • ${me.role}` : "No session";

  return (
    <div className="relative">
      <button
        className="px-3 py-1.5 rounded-full border text-sm hover:bg-slate-50 transition"
        onClick={() => setOpen((v) => !v)}
        title="Current user / switch"
      >
        {label}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg z-20">
          <div className="p-2 border-b text-xs text-slate-500 flex items-center gap-2">
            <span>Switch user</span>
            <button
              className="ml-auto px-2 py-0.5 rounded border text-[11px]"
              onClick={() => {
                // hard refresh the list if you added users elsewhere
                void loadUsers();
              }}
            >
              Refresh
            </button>
          </div>

          <ul className="max-h-64 overflow-auto">
            {all.map((u) => (
              <li key={u.id}>
                <button
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                    me?.id === u.id ? "bg-slate-100/80" : ""
                  }`}
                  onClick={() => switchTo(u.id)}
                  disabled={busy || me?.id === u.id}
                >
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-slate-500">
                    {u.role}
                    {u.domains?.length ? ` • ${u.domains.join(", ")}` : ""}
                  </div>
                </button>
              </li>
            ))}
            {!all.length && <li className="px-3 py-2 text-sm text-slate-500">No users.</li>}
          </ul>

          <div className="p-2 border-t flex gap-2">
            <button className="px-3 py-1 rounded-lg border text-sm" onClick={clearSession} disabled={busy || !me}>
              Clear
            </button>
            <button className="px-3 py-1 rounded-lg border text-sm ml-auto" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}