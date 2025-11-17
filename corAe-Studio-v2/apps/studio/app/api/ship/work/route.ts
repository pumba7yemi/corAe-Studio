// apps/studio/app/api/ship/work/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    routes: {
      operations: "/api/ship/work/operations",
      finance: "/api/ship/work/finance",
      partners: "/api/ship/work/partners",
    },
  });
}