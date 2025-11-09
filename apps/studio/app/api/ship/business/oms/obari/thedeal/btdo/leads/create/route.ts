// apps/studio/app/api/ship/business/oms/obari/thedeal/btdo/leads/create/route.ts
// BTDO — Leads : Create
// POST JSON:
// {
//   "title": "Inbound enquiry",
//   "source": "WEBSITE" | "PHONE" | "EMAIL" | "OTHER",   // free string accepted
//   "contactName": "Alex",
//   "contactPhone": "+971...",
//   "contactEmail": "a@b.com",
//   "notes": "optional initial notes"
// }
//
// Response: { ok:true, lead:{ ... } } | { ok:false, error:"..." }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateLeadBody = {
  title?: string;
  source?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
};

function cleanStr(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length ? s : undefined;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateLeadBody;

    const title = cleanStr(body.title);
    const source = cleanStr(body.source) ?? "OTHER";
    const contactName = cleanStr(body.contactName);
    const contactPhone = cleanStr(body.contactPhone);
    const contactEmail = cleanStr(body.contactEmail);
    const notes = cleanStr(body.notes);

    if (!title) {
      return NextResponse.json(
        { ok: false, error: "title is required" },
        { status: 400 }
      );
    }

    // Stage is a simple string in schema ("NEW" | "QUALIFY" | ...). Default NEW.
  const lead = await (prisma as any).btdoLead.create({
      data: {
        title,
        source,
        contactName,
        contactPhone,
        contactEmail,
        notes,
        stage: "NEW",
      },
      select: {
        id: true,
        title: true,
        source: true,
        contactName: true,
        contactPhone: true,
        contactEmail: true,
        notes: true,
        stage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Optional seed event for audit trail
    await (prisma as any).btdoLeadEvent.create({
      data: {
        leadId: lead.id,
        kind: "CREATE",
        message: `Lead created via API (${source})`,
      },
    }).catch(() => {
      // non-blocking: if events model exists it logs, otherwise ignore
    });

    return NextResponse.json({ ok: true, lead });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "failed to create lead" },
      { status: 500 }
    );
  }
}

// Optional GET → describes contract for quick dev checks
export async function GET() {
  return NextResponse.json({
    ok: true,
    info: "POST this route to create a BTDO lead.",
    expects: {
      title: "string (required)",
      source: "string e.g. WEBSITE | PHONE | EMAIL (optional)",
      contactName: "string (optional)",
      contactPhone: "string (optional)",
      contactEmail: "string (optional)",
      notes: "string (optional)",
    },
  });
}
