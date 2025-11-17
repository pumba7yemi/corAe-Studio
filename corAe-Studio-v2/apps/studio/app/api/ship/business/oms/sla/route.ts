import { NextRequest, NextResponse } from "next/server";

type SLA = {
  bookingCommit_hours: number;
  activeDelay_minutes: number;
  reportingUpload_hours: number;
  reportingSignoff_hours: number;
  invoiceRaise_hours: number;
};

type EscalationLevel = { after_minutes: number; notifyRoles: string[] };

const mem = {
  sla: {
    bookingCommit_hours: 4,
    activeDelay_minutes: 30,
    reportingUpload_hours: 12,
    reportingSignoff_hours: 24,
    invoiceRaise_hours: 24,
  } as SLA,
  escalation: {
    levels: [
      { after_minutes: 30, notifyRoles: ["OperationsManager"] },
      { after_minutes: 120, notifyRoles: ["FinanceManager"] },
      { after_minutes: 360, notifyRoles: ["Owner"] },
    ] as EscalationLevel[],
  },
};

export async function GET() {
  return NextResponse.json({ ok: true, ...mem });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body?.sla) mem.sla = { ...mem.sla, ...body.sla };
    if (body?.escalation?.levels) {
      const levels = body.escalation.levels as EscalationLevel[];
      mem.escalation.levels = Array.isArray(levels)
        ? levels
            .map((l) => ({
              after_minutes: Number(l.after_minutes || 0),
              notifyRoles: (l.notifyRoles || []).map((s) => String(s).trim()).filter(Boolean),
            }))
            .filter((l) => l.after_minutes > 0 && l.notifyRoles.length > 0)
            .sort((a, b) => a.after_minutes - b.after_minutes)
        : mem.escalation.levels;
    }
    return NextResponse.json({ ok: true, ...mem });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Bad request" }, { status: 400 });
  }
}