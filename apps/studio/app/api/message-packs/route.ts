// apps/studio/app/api/message-packs/route.ts
// corAe OMS Message Packs API — lists all packs with template counts.

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic"; // prevent static cache during dev

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(_req: Request) {
  try {
    const packs = await (prisma as any).messagePack.findMany({
      include: { templates: { select: { id: true } } },
      orderBy: [{ namespace: "asc" }, { name: "asc" }],
    });

    const data = (packs as any[]).map((p: any) => ({
      id: p.id,
      name: p.name,
      namespace: p.namespace,
      description: p.description,
      templateCount: p.templates.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({ ok: true, packs: data });
  } catch (err) {
    console.error("GET /api/message-packs failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch message packs" },
      { status: 500 }
    );
  }
}
