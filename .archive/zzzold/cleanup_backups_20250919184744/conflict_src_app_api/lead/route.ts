import { NextResponse } from "next/server";
import { z } from "zod";
import { sendLeadEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  variant: z.enum(["home", "work", "business", "vendor"]).default("business"),
  utm: z.any().optional(),
  experiment: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const parsed = schema.parse(data);

    // TODO: also store in your DB/CRM if desired
    const mail = await sendLeadEmail(parsed);

    return NextResponse.json({ ok: true, mail });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Invalid request" }, { status: 400 });
  }
}