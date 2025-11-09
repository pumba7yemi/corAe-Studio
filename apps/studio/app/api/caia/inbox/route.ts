import { NextResponse } from "next/server";
import { fetchInbox } from "@/lib/caia/channels/email";

export async function GET() {
  try {
    const items = await fetchInbox({ sinceHours: 24 });
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
