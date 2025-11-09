import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/ship/business/oms/onboarding/leads/:id
 * Returns a lean view of a lead so the signup page can prefill.
 *
 * Response:
 *  {
 *    ok: true,
 *    lead: {
 *      id, fullName, email, phone,
 *      productInterestedIn, source, intent, roles, meta
 *    }
 *  }
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const lead = await (prisma as any).lead.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        productInterestedIn: true,
        source: true,
        intent: true,
        meta: true,
      },
    });

    if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // normalize roles from meta if present
    const roles =
      (lead?.meta && Array.isArray(lead.meta.roles) && lead.meta.roles.length
        ? lead.meta.roles
        : ["CLIENT"]);

    return NextResponse.json({
      ok: true,
      lead: {
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        productInterestedIn: lead.productInterestedIn,
        source: lead.source,
        intent: lead.intent === "SUBSCRIBE" ? "Subscribe" : "Set up",
        roles,
        meta: lead.meta ?? {},
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}