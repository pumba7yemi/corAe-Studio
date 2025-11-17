// app/lib/cims/users.ts
export type UserRole = "owner" | "admin" | "manager" | "agent" | "viewer";
export type CIMSDomain = "management" | "hr" | "finance" | "operations" | "marketing";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  domains?: CIMSDomain[];          // optional, keep your shape
  avatarUrl?: string;
  createdAt: string;               // ISO
};

const USERS: Map<string, User> = new Map();

function uid(prefix = "u") {
  try {
    // @ts-ignore runtime in node/edge
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}
  return `${prefix}_${Date.now().toString(36)}`;
}

/**
 * In-memory Users store with CRUD-style helpers.
 * - Keeps your public shape (admin/viewer, optional domains, avatarUrl)
 * - Adds `add`, `update`, `clear` for compatibility with callers
 * - `create` is the ergonomic constructor; `add` accepts a full User
 */
export const UsersStore = {
  async list(): Promise<User[]> {
    return Array.from(USERS.values());
  },

  async get(id: string): Promise<User | undefined> {
    return USERS.get(id);
  },

  /** Accepts a fully-formed User (compat with older code paths). */
  async add(u: User): Promise<void> {
    if (!u.id) u.id = uid();
    if (!u.createdAt) u.createdAt = new Date().toISOString();
    USERS.set(u.id, u);
  },

  /** Preferred helper: creates a User from minimal input. */
  async create(input: {
    name: string;
    role?: UserRole;
    domains?: User["domains"];
    avatarUrl?: string;
  }): Promise<User> {
    const user: User = {
      id: uid(),
      name: (input.name || "Unnamed").trim(),
      role: input.role ?? "agent",
      domains: input.domains ?? ["operations"],
      avatarUrl: input.avatarUrl,
      createdAt: new Date().toISOString(),
    };
    USERS.set(user.id, user);
    return user;
  },

  async update(id: string, data: Partial<User>): Promise<User | undefined> {
    const cur = USERS.get(id);
    if (!cur) return undefined;
    const next: User = { ...cur, ...data, id: cur.id }; // never change id
    USERS.set(id, next);
    return next;
  },

  async remove(id: string): Promise<boolean> {
    return USERS.delete(id);
  },

  async clear(): Promise<void> {
    USERS.clear();
  },
};

// Dev seed (runs once per boot)
void (async () => {
  if ((await UsersStore.list()).length) return;
  await UsersStore.create({ name: "Owner", role: "owner", domains: ["management"] });
  await UsersStore.create({ name: "Ops Agent", role: "agent", domains: ["operations"] });
})();
