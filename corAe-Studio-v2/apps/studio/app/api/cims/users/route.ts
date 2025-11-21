// app/api/cims/users/route.ts
import { NextResponse, NextRequest } from "next/server";
import { UsersStore, type User, type UserRole } from "@/app/lib/cims/users";
import { CimsSession } from "@/app/lib/cims/session";

/**
 * Unified Users + Session API
 *
 * GET    /api/cims/users
 *   -> { ok, users, active }
 *
 * POST   /api/cims/users
 *   -> Switch active user: { switchId: string }  (or { id } with no name/role)
 *   -> Create user:        { name: string, role?: UserRole, domains?: CIMSDomain[] }
 *
 * PATCH  /api/cims/users
 *   -> Update user:        { id: string, name?: string, role?: UserRole, domains?: CIMSDomain[] }
 */

export async function GET() {
  const [users, active] = await Promise.all([UsersStore.list(), CimsSession.current()]);
  return NextResponse.json({ ok: true, users, active });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as
      | { switchId?: string; id?: string }
      | (Partial<User> & { name?: string; role?: UserRole });

    // —— Switch active user (preferred: switchId; fallback: id when no create fields) ——
    const wantsSwitch =
      typeof (body as any).switchId === "string" ||
      (typeof (body as any).id === "string" &&
        typeof (body as any).name !== "string" &&
        typeof (body as any).role !== "string");

    if (wantsSwitch) {
      const switchId = (body as any).switchId ?? (body as any).id;
      const switched = await CimsSession.switchTo(String(switchId));
      if (!switched) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
      const users = await UsersStore.list();
      return NextResponse.json({ ok: true, active: switched, users });
    }

    // —— Create user ——
    const name = (body as any)?.name?.toString().trim();
    if (!name) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 });

    const role = ((body as any)?.role as UserRole) ?? "agent";
    const domains = Array.isArray((body as any)?.domains) ? ((body as any).domains as User["domains"]) : undefined;

    const user = await UsersStore.create({ name, role, domains });
    // If no active user yet, set this one active for convenience
    const active = (await CimsSession.current()) ?? (await CimsSession.switchTo(user.id));
    return NextResponse.json({ ok: true, user, active });
  } catch (err) {
    console.error("POST /api/cims/users failed:", err);
    return NextResponse.json({ ok: false, error: "failed to process request" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<User> & { id?: string };
    const id = body?.id?.toString().trim();
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

    const updates: Partial<User> = {};
    if (typeof body.name === "string") updates.name = body.name;
    if (typeof body.role === "string") updates.role = body.role as UserRole;
    if (Array.isArray(body.domains)) updates.domains = body.domains as User["domains"];

    const user = await UsersStore.update(id, updates);
    // refresh active if we updated the active user
    const active = (await CimsSession.current());
    const activeOut = active && active.id === id ? user : active;

    return NextResponse.json({ ok: true, user, active: activeOut });
  } catch (err) {
    console.error("PATCH /api/cims/users failed:", err);
    return NextResponse.json({ ok: false, error: "failed to update user" }, { status: 500 });
  }
}
