import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type Payload = {
  legalName: string;
  jurisdiction: string;
  activities?: string[]; // optional tags
  tenant?: {
    slug: string;
    brandName: string;
    domain?: string;
    theme?: Record<string, unknown>;
  };
};

function normDomain(d?: string | null) {
  if (!d) return null;
  const x = d.trim().toLowerCase();
  return x.replace(/^https?:\/\//, ""); // store bare domain
}

export async function POST(req: NextRequest) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const legalName = body.legalName?.trim();
  const jurisdiction = body.jurisdiction?.trim();

  if (!legalName || !jurisdiction) {
    return NextResponse.json({ error: "Missing company basics (legalName, jurisdiction)" }, { status: 400 });
  }
  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1) Upsert Tenant (optional)
      let tenantId: string | null = null;
      if (body.tenant?.slug && body.tenant.brandName) {
        const slug = body.tenant.slug.trim().toLowerCase();
        const brandName = body.tenant.brandName.trim();
        const domain = normDomain(body.tenant.domain);
        const theme = body.tenant.theme ?? {};

        const tenant = await (tx as any).tenant.upsert({
          where: { slug },
          update: { brandName, domain, theme },
          create: { slug, brandName, domain, theme },
          select: { id: true },
        });
        tenantId = tenant.id;
      }

      // 2) Idempotent Company create (avoid dupes by legalName+jurisdiction)
      const existing = await (tx as any).companyIdentity.findFirst({
        where: { legalName, jurisdiction },
        select: { id: true },
      });

      const company =
        existing ??
        (await (tx as any).companyIdentity.create({
          data: {
            legalName,
            jurisdiction,
            activities: body.activities ?? [],
            tenantId,
          },
          select: { id: true },
        }));

      // 3) (Optional) Chrono log, if Chrono model exists
      try {
        await (tx as any).chrono.create({
          data: {
            scope: "GENERAL",
            message: `Company created/linked: ${legalName} (${jurisdiction})`,
            refType: "CompanyIdentity",
            refId: company.id,
          },
        });
      } catch {
        // ignore if Chrono not present yet
      }

      return { companyId: company.id, tenantId };
    });

    return NextResponse.json({
      ok: true,
      companyId: result.companyId,
      tenantId: result.tenantId,
      next: "/ship/business/oms/onboarding/wizard/hr",
    });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}