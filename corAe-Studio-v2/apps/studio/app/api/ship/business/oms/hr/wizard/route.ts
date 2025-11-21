import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

type Payload = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  roleTitle: string;
  status?: "APPLICANT" | "ACTIVE" | "PROBATION";
  hiredAt?: string; // ISO
};

function mkCode(prefix: string) {
  const n = Math.floor(Math.random() * 1_000_000).toString().padStart(6, "0");
  return `${prefix}${n}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload;

  if (!body.firstName || !body.lastName || !body.roleTitle) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 90); // probation default

  const status = body.status ?? "APPLICANT";
  const hiredAt = body.hiredAt ? new Date(body.hiredAt) : undefined;

  const employee = await prisma.employee.create({
    data: {
      code: mkCode("EMP"),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      roleTitle: body.roleTitle.trim(),
      status,
      hiredAt,
    },
  });

  const appraisal = await prisma.appraisal.create({
    data: {
      employeeId: employee.id,
      status: "DRAFT",
      periodStart,
      periodEnd,
      summary: "Auto-created draft appraisal (pre-First-Trade).",
      scores: {},
    },
  });

  await prisma.chrono.create({
    data: {
      scope: "HR",
      message: `Employee onboarded: ${employee.firstName} ${employee.lastName} (${employee.code}). Draft appraisal ${appraisal.id} opened for probation period.`,
      refType: "Employee",
      refId: employee.id,
      employeeId: employee.id,
    },
  });

  return NextResponse.json({ ok: true, employee, appraisal });
}