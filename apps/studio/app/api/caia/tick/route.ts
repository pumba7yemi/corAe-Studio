import { NextResponse } from "next/server";
import { composeDailyMessages } from "@/lib/caia/brain";
import { sendViaCIMS } from "@/lib/caia/channels/cims";
import { sendEmail } from "@/lib/caia/channels/email";

export async function POST() {
  try {
    const messages = await composeDailyMessages(new Date());
    for (const m of messages) {
      if (m.channel === "cims") await sendViaCIMS(m);
      else if (m.channel === "email") await sendEmail(m);
    }
    return NextResponse.json({ ok: true, sent: messages.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
