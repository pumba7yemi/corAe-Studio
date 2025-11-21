import { NextResponse } from "next/server";
import { sendToCIMS } from "@/lib/cims/send";

export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  try {
    await sendToCIMS(payload as any);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as any)?.message ?? String(err) });
  }
}
