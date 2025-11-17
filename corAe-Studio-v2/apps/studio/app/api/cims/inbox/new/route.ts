import { NextResponse, NextRequest } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * POST /api/cims/inbox/new
 * body: { from?: string, subject: string, type?: "automate"|"vendor"|"customer"|"system", domain?: "management"|"hr"|"finance"|"operations"|"marketing" }
 *
 * Creates a new inbox item.
 * Used primarily for testing or Automate signal injection.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const subject = (body?.subject ?? "").toString().trim();
    const from = (body?.from ?? "Automate").toString().trim();
    const type = (body?.type ?? "automate").toString().trim();
    const domain = (body?.domain ?? "operations").toString().trim();

    if (!subject) {
      return NextResponse.json(
        { ok: false, error: "Missing 'subject' in request body" },
        { status: 400 }
      );
    }

    const item = {
      id: `in_${Date.now().toString(36)}`,
      from,
      subject,
      time: new Date().toISOString().slice(11, 16),
      type,
      status: "new",
      domain,
    };

    await CIMSStore.inbox.add(item as any);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("POST /api/cims/inbox/new failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to create inbox item" },
      { status: 500 }
    );
  }
}

/**
 * Optional GET helper for manual testing or docs.
 */
export async function GET() {
  return NextResponse.json({
    ok: false,
    info: "POST JSON { subject, from?, type?, domain? } to create a new inbox item.",
    example: {
      subject: "Vendor price confirmation request",
      from: "Automate",
      type: "automate",
      domain: "operations",
    },
  });
}
