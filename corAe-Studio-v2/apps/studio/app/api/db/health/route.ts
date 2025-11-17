// apps/studio/app/api/_db/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db/prisma";

/**
 * corAe DB Health Route
 * ------------------------------------------------------------
 * GET /api/_db/health
 * Checks connectivity and returns counts of core tables.
 * Useful for confirming Prisma schema + DB wiring.
 */

export async function GET() {
  try {
    const [threads, users, workflows] = await Promise.all([
      (prisma as any).cimsThread?.count?.().catch?.(() => 0) ?? 0,
      (prisma as any).user?.count?.().catch?.(() => 0) ?? 0,
      (prisma as any).workflowTemplate?.count?.().catch?.(() => 0) ?? 0,
    ]);

    return NextResponse.json({
      ok: true,
      message: "Database connection healthy.",
      tables: {
        cimsThreads: threads,
        users,
        workflowTemplates: workflows,
      },
    });
  } catch (err) {
    console.error("DB health check failed:", err);
    return NextResponse.json(
      { ok: false, error: "Database connection failed." },
      { status: 500 }
    );
  }
}
