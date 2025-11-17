import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    ok:true,
    build: new Date().toISOString(),
    env: process.env.NODE_ENV ?? "unknown",
    version: "CIMS Debug Suite v1.0"
  });
}
