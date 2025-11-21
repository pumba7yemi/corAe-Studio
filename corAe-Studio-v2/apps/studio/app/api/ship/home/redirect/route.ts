import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getOwnerId } from "@/app/lib/auth/owner";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const affiliateUrl = url.searchParams.get("u");
  const merchant = url.searchParams.get("m") ?? "generic";
  const itemId = url.searchParams.get("itemId") ?? undefined;
  const shareSlug = url.searchParams.get("share") ?? undefined;
  if (!affiliateUrl) return new NextResponse("Bad Request: missing u", { status: 400 });

  try {
    const ownerId = await getOwnerId();
    await (prisma as any).cashbackLedger.create({
      data: {
        ownerId,
        itemId,
        shareSlug,
        merchant,
        cashbackPct: 0,
        event: "CLICK",
        affiliateUrl,
        referer: req.headers.get("referer") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });
  } catch (e) {
    // swallow logging errors; still redirect
    console.debug("cashback log error", String(e));
  }

  return NextResponse.redirect(affiliateUrl, { status: 302 });
}
