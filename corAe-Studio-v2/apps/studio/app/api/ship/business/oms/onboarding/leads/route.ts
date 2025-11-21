import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/business/oms/onboarding/leads
 * Capture a marketing lead (first contact).
 *
 * Body:
 *  {
 *    fullName: string,
 *    email?: string,
 *    phone?: string,
 *    product?: string,                 // product interested in
 *    source?: string,                  // "How did you hear about us?"
 *    roles?: string[],                 // ["CLIENT","SUPPLIER","SUBCONTRACTOR","PARTNER"]
 *    intent?: "Set up" | "Subscribe",
 *    tenantSlug?: string | null,       // optional (white label)
 *    meta?: Record<string, any>        // anything extra
 *  }
 *
 * Response:
 *  { ok: true, leadId, contactId, signupUrl }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const fullName = String(body.fullName || "").trim();
    const email = body.email ? String(body.email).trim() : null;
    const phone = body.phone ? String(body.phone).trim() : null;
    const product = body.product ? String(body.product).trim() : "";
    const source = body.source ? String(body.source).trim() : ""; // how did you hear about us?
    const roles = Array.isArray(body.roles) ? body.roles.filter(Boolean) : ["CLIENT"];
    const intent = body.intent === "Subscribe" ? "Subscribe" : "Set up";
    const tenantSlug = body.tenantSlug ? String(body.tenantSlug).trim() : null;
    const extraMeta = (body.meta && typeof body.meta === "object") ? body.meta : {};

    if (!fullName || (!email && !phone)) {
      return NextResponse.json({ error: "fullName and (email or phone) required" }, { status: 400 });
    }

    // Optional: resolve tenant by slug if you run multi-tenant
    const tenant = tenantSlug
      ? await (prisma as any).tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true } })
      : null;

    // Upsert the contact (prefer email, then phone, else create by name)
    const contact = await upsertContact({ fullName, email, phone });

    // Create the lead
    const lead = await (prisma as any).lead.create({
      data: {
        tenantId: tenant?.id ?? undefined,
        accountId: null,
        intent: intent === "Subscribe" ? "SUBSCRIBE" : "SETUP",
        productInterestedIn: product || "General",
        fullName,
        email,
        phone,
        source: source || null,
        meta: {
          roles,
          marketing: { howHeard: source || null },
          ...extraMeta,
        },
        status: "NEW",
      },
      select: { id: true },
    });

    // Chrono log
    await safeChrono({
      scope: "MARKETING",
      message: `New lead captured â€” ${fullName}${product ? ` (Product: ${product})` : ""}${source ? ` [Source: ${source}]` : ""}.`,
      refType: "Lead",
      refId: lead.id,
      contactId: contact?.id,
    });

    // Return a signup URL that can be used to collect full details right away
    const signupUrl = `/business/oms/onboarding/wizard/signup?leadId=${encodeURIComponent(lead.id)}`;

    return NextResponse.json({ ok: true, leadId: lead.id, contactId: contact?.id, signupUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}

/** â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

async function upsertContact(c: { fullName: string; email: string | null; phone: string | null }) {
  // prefer email match, then phone match
  if (c.email) {
    const existing = await (prisma as any).contact.findFirst({ where: { email: c.email } });
    if (existing) {
      return (prisma as any).contact.update({
        where: { id: existing.id },
        data: {
          fullName: c.fullName || existing.fullName,
          phone: c.phone ?? existing.phone,
        },
      });
    }
    return (prisma as any).contact.create({ data: { fullName: c.fullName, email: c.email, phone: c.phone } });
  }
  if (c.phone) {
    const existing = await (prisma as any).contact.findFirst({ where: { phone: c.phone } });
    if (existing) {
      return (prisma as any).contact.update({
        where: { id: existing.id },
        data: {
          fullName: c.fullName || existing.fullName,
          email: c.email ?? existing.email,
        },
      });
    }
    return (prisma as any).contact.create({ data: { fullName: c.fullName, phone: c.phone } });
  }
  return (prisma as any).contact.create({ data: { fullName: c.fullName } });
}

async function safeChrono(data: {
  scope: "GENERAL" | "WORKFLOWS" | "OPERATIONS" | "HR" | "FINANCE" | "MARKETING" | "SALES";
  message: string;
  refType?: string;
  refId?: string;
  dealId?: string;
  contactId?: string;
}) {
  try {
    await (prisma as any).chrono.create({ data });
  } catch {
    // swallow if Chrono table not migrated yet
  }
}
