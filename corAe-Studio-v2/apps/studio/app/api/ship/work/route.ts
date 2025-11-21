// apps/studio/app/api/work/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    routes: {
      operations: "/api/work/operations",
      finance: "/api/work/finance",
      partners: "/api/work/partners",
    },
  });
}
