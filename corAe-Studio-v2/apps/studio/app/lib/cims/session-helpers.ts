// apps/studio/app/lib/cims/session-helpers.ts
import type { NextRequest } from "next/server";
import { cookies as headerCookies } from "next/headers";
import { UsersStore, type User } from "@/app/lib/cims/users";

export const CIMS_UID_COOKIE = "cims_uid";

// Create (or reuse) a default Owner user if nothing is found
async function ensureFallbackOwner(): Promise<User> {
  const all = await UsersStore.list();
  if (all.length > 0) return all[0];

  const owner: User = {
    id: (globalThis as any).crypto?.randomUUID?.() ?? `u_${Date.now()}`,
    name: "Owner",
    role: "owner",
    domains: ["management"],
    createdAt: new Date().toISOString(),
  };
  await UsersStore.add(owner);
  return owner;
}

/**
 * For API routes (you have a NextRequest).
 * Works on both Node/Edge by normalizing req.cookies to a store with .get().
 */
export async function getSessionUser(req: NextRequest): Promise<User> {
  // Next 15: req.cookies is a function on Edge and an object on Node.
  const rc: any = (req as any).cookies;
  const cookieStore =
    rc && typeof rc.get === "function" ? rc : (typeof rc === "function" ? await rc() : undefined);

  const uid: string | undefined = cookieStore?.get?.(CIMS_UID_COOKIE)?.value?.trim();

  if (uid) {
    const u = await UsersStore.get(uid);
    if (u) return u;
  }
  return ensureFallbackOwner();
}

/**
 * For Server Components / Server Actions (no NextRequest).
 * Next 15: cookies() is async.
 */
export async function getSessionUserFromHeaders(): Promise<User> {
  const cookieStore = await headerCookies(); // <- IMPORTANT: await in Next 15+
  const uid = cookieStore.get(CIMS_UID_COOKIE)?.value?.trim();

  if (uid) {
    const u = await UsersStore.get(uid);
    if (u) return u;
  }
  return ensureFallbackOwner();
}

/** Optional helpers (handy in actions or route handlers) */
export async function setSessionUidCookie(uid: string) {
  const c = await headerCookies();
  c.set(CIMS_UID_COOKIE, uid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // maxAge: 30 days
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionUidCookie() {
  const c = await headerCookies();
  c.delete(CIMS_UID_COOKIE);
}
