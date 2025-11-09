// apps/ship/app/api/export/marketing/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildMarketingPdf } from "../../../lib/export/marketing/template";

type SlugParams = { slug: string };
export async function GET(request: NextRequest, context: { params: Promise<SlugParams> }) {
  const { slug: raw } = await context.params;
  const slug = (raw || "dtd") as "dtd" | "pulse" | "obari";
  const pdf = await buildMarketingPdf(slug); // Uint8Array

  // Convert Uint8Array to a tightly-sliced ArrayBuffer for BodyInit compatibility
  const arrayBuffer =
    pdf.byteOffset === 0 && pdf.byteLength === pdf.buffer.byteLength
      ? pdf.buffer
      : pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength);

  return new NextResponse(arrayBuffer as any, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}-onepager.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}