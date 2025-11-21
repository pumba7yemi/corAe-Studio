// apps/ship/app/api/lib/export/marketing/template.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function buildMarketingPdf(slug: "dtd" | "pulse" | "obari") {
  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 landscape
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const title =
    slug === "dtd" ? "3³ Digital Task Diary"
    : slug === "pulse" ? "Pulse"
    : "OBARI™";

  // Header band (dark)
  page.drawRectangle({ x: 0, y: 520, width: 842, height: 75, color: rgb(0.08, 0.1, 0.12) });
  page.drawText("corAe • CAIA • Lifeᵒˢ™", { x: 24, y: 558, size: 10, font, color: rgb(0.6, 0.8, 0.95) });
  page.drawText(title, { x: 24, y: 535, size: 24, font, color: rgb(0.7, 0.85, 1) });

  // Body placeholder matching app’s dark style
  page.drawText("One-pager template — marketing copy and visuals go here.", {
    x: 24, y: 480, size: 12, font, color: rgb(0.85, 0.9, 0.95),
  });

  return await doc.save();
}