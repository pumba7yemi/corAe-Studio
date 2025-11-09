import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: process.env.SHIP_VERSION || "0.2.0",
    ts: new Date().toISOString(),
  });
}
