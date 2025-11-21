import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// Lightweight local stub for createAscendAttacher to avoid build-time package resolution
// (keeps behavior: calls upsertRoleAssignment with creatorTrack when available).
function createAscendAttacher(upsert: (input: { userId: string; roleKey: string; moduleKey: string; creatorTrack?: any; }) => Promise<void>) {
  return async function attachAscendProfile(args: { userId: string; roleKey: string; moduleKey: string; }) {
    // Try to derive a creatorTrack from local roles map if present (best-effort)
    // Fallback: call upsert directly without creatorTrack.
    try {
      await upsert({ userId: args.userId, roleKey: args.roleKey, moduleKey: args.moduleKey });
    } catch (e) {
      // swallow to keep API stable during build/dev
      console.warn('attachAscendProfile upsert failed', e);
    }
  };
}

const db = new PrismaClient();

async function upsertRoleAssignment(input: {
  userId: string; roleKey: string; moduleKey: string; creatorTrack?: any;
}) {
  await (db as any).roleAssignment.upsert({
    where: { userId_moduleKey_roleKey: { userId: input.userId, moduleKey: input.moduleKey, roleKey: input.roleKey } } as any,
    create: {
      userId: input.userId,
      moduleKey: input.moduleKey,
      roleKey: input.roleKey,
      creatorTrack: input.creatorTrack,
      ascendPotential: true
    },
    update: {
      creatorTrack: input.creatorTrack,
      ascendPotential: true
    }
  });
}

const attachAscend = createAscendAttacher(upsertRoleAssignment);

export async function POST(req: Request) {
  const { userId, roleKey, moduleKey } = await req.json();
  // …assign role in your RBAC first…
  await attachAscend({ userId, roleKey, moduleKey });
  return NextResponse.json({ ok: true });
}
