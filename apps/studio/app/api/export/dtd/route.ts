// apps/studio/app/api/export/dtd/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildDtdPdf, type DtdExportData } from "@/lib/export/pdf";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json().catch(() => ({}))) as DtdExportData;
    const pdf = await buildDtdPdf(data);
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="corae-3cDTD.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // convenience: GET returns the default demo
  const pdf = await buildDtdPdf();
  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="corae-3cDTD.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}