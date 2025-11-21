import { NextResponse } from "next/server";
import { seedCIMS } from "@/app/lib/cims/store";

export async function POST() {
  await seedCIMS();
  return NextResponse.json({ ok: true });
}
