// app/lib/cims/session.ts
import { UsersStore, type User } from "@/app/lib/cims/users";

/**
 * corAe CIMS Session Manager
 * - Keeps track of current active user (simulated session)
 * - Shared across tabs in-memory only (for dev)
 * - Future: replace with JWT or CAIA Auth microservice
 */

let ACTIVE: User | null = null;

export const CimsSession = {
  async current(): Promise<User | null> {
    if (!ACTIVE) {
      const list = await UsersStore.list();
      ACTIVE = list.find((u) => u.name === "CAIA") ?? list[0] ?? null;
    }
    return ACTIVE;
  },

  async switchTo(nameOrId: string): Promise<User | null> {
    const users = await UsersStore.list();
    const found = users.find((u) => u.id === nameOrId || u.name === nameOrId);
    if (!found) return null;
    ACTIVE = found;
    console.log(`[CIMS] Active user → ${found.name} (${found.role})`);
    return ACTIVE;
  },

  async list(): Promise<User[]> {
    return UsersStore.list();
  },
  async clear(): Promise<null> {
    // For dev: clear the in-memory active session so callers can show "No session"
    ACTIVE = null;
    return null;
  },
};
