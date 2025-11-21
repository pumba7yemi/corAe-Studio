import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Seeds/refreshes DRAFT appraisals for existing employees.
 * Payload:
 *  - employeeIds?: string[] (if omitted = all ACTIVE/PROBATION)
 *  - days?: number (default 90)
 */
export async function POST(req: NextRequest) {
  const { employeeIds, days } = (await req.json().catch(() => ({}))) as {
    employeeIds?: string[];
    days?: number;
  };

  const periodDays = Number.isFinite(days) && days! > 0 ? days! : 90;

  const where = employeeIds?.length
    ? { id: { in: employeeIds } }
    : { OR: [{ status: "ACTIVE" }, { status: "PROBATION" }] };

  const employees = await (prisma as any).employee.findMany({ where, select: { id: true } });

  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + periodDays);

  for (const emp of employees) {
    await (prisma as any).appraisal.create({
      data: {
        employeeId: emp.id,
        status: "DRAFT",
        periodStart: start,
        periodEnd: end,
        summary: "Auto-seeded appraisal for existing staff.",
        scores: {},
      },
    });
    await (prisma as any).chrono.create({
      data: {
        scope: "HR",
        message: `Draft appraisal opened (bulk seed ${periodDays}d).`,
        refType: "Appraisal",
        refId: emp.id,
        employeeId: emp.id,
      },
    });
  }

  return NextResponse.json({ ok: true, count: employees.length });
}