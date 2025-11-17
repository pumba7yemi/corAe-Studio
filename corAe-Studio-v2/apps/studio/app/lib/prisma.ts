// FILE: apps/studio/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// why: prevent multiple clients during Next dev/hot-reload
const g = globalThis as unknown as { _prisma?: PrismaClient };

export const prisma =
  g._prisma ??
  new PrismaClient({
    // log: ['query','error','warn'], // enable if you need verbose logs
  });

if (!g._prisma && process.env.NODE_ENV !== 'production') g._prisma = prisma;


// FILE: apps/studio/app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  note: z.string().trim().min(1, "note required").max(500, "note too long"),
});

// GET /api/health -> latest row
export async function GET() {
  try {
    const latest = await db.health.findFirst({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, latest });
  } catch (e: any) {
    // why: surface actual error to client for quick debugging
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}

// POST /api/health -> create row { note }
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = CreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const created = await db.health.create({
      data: { note: parsed.data.note },
    });

    return NextResponse.json({ ok: true, created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
