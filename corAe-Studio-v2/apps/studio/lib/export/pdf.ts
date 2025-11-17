// apps/studio/lib/export/pdf.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type DtdExportData = {
  title?: string;                 // default: "3³ Digital Task Diary"
  subtitle?: string;              // default: "28-Day Cadence • Important • Inbox • Ongoing"
  generatedAtISO?: string;        // default: new Date().toISOString()
  lanes?: Array<{ name: string; items: string[] }>; // 3 lanes listing
  stripDays?: number;             // default: 28 (renders simple bars)
};

const DARK = {
  bg: rgb(18/255, 24/255, 38/255),           // slate-900-ish
  panel: rgb(30/255, 41/255, 59/255),        // slate-800-ish
  border: rgb(51/255, 65/255, 85/255),       // slate-700-ish
  text: rgb(226/255, 232/255, 240/255),      // slate-200-ish
  sub: rgb(148/255, 163/255, 184/255),       // slate-400-ish
  accent: rgb(16/255, 185/255, 129/255),     // emerald-500
  accentSoft: rgb(52/255, 211/255, 153/255), // emerald-400
};

export async function buildDtdPdf(input: DtdExportData = {}) {
  const {
    title = "3³\xa0Digital Task Diary",
    subtitle = "28-Day Cadence • Important • Inbox • Ongoing",
    generatedAtISO = new Date().toISOString(),
    lanes = [
      { name: "Important", items: ["I-001: Review contracts", "I-002: Close Q4 plan"] },
      { name: "Inbox", items: ["X-001: Parse supplier email", "X-002: Draft policy"] },
      { name: "Ongoing", items: ["O-001: Weekly ops review", "O-002: KPI snapshot"] },
    ],
    stripDays = 28,
  } = input;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 portrait (pt)
  const { width, height } = page.getSize();

  // fonts
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // background
  page.drawRectangle({ x: 0, y: 0, width, height, color: DARK.bg });

  // header strip
  page.drawRectangle({
    x: 24, y: height - 90, width: width - 48, height: 66,
    color: DARK.panel, borderColor: DARK.border, borderWidth: 1,
  });

  // header text
  page.drawText(title, {
    x: 40, y: height - 60, size: 18, font: fontBold, color: DARK.accentSoft,
  });
  page.drawText(subtitle, {
    x: 40, y: height - 80, size: 10, font, color: DARK.sub,
  });

  // timestamp
  const ts = new Date(generatedAtISO).toLocaleString();
  const tsW = font.widthOfTextAtSize(ts, 9);
  page.drawText(ts, {
    x: width - 40 - tsW, y: height - 80, size: 9, font, color: DARK.sub,
  });

  // 28-day strip (simple bars)
  const stripX = 24, stripY = height - 180, stripW = width - 48, stripH = 60;
  page.drawRectangle({
    x: stripX, y: stripY, width: stripW, height: stripH,
    color: DARK.panel, borderColor: DARK.border, borderWidth: 1,
  });

  const gap = 4;
  const cellW = (stripW - (stripDays + 1) * gap) / stripDays;
  for (let i = 0; i < stripDays; i++) {
    const w = cellW;
    const h = 10 + ((i % 5) * 6); // little variation
    const cx = stripX + gap + i * (cellW + gap);
    const cy = stripY + 16;
    page.drawRectangle({ x: cx, y: cy, width: w, height: h, color: DARK.accent });
  }

  page.drawText("28-Day Cadence", {
    x: stripX + 12, y: stripY + stripH - 18, size: 11, font: fontBold, color: DARK.text,
  });

  // three columns for lanes
  const cols = lanes.slice(0, 3);
  const colW = (stripW - gap * 2) / 3;
  const colY = stripY - 16 - 180;
  for (let i = 0; i < cols.length; i++) {
    const cx = stripX + i * (colW + gap);
    // card
    page.drawRectangle({
      x: cx, y: colY, width: colW, height: 180,
      color: DARK.panel, borderColor: DARK.border, borderWidth: 1,
    });
    // title
    page.drawText(cols[i].name, {
      x: cx + 12, y: colY + 160, size: 12, font: fontBold, color: DARK.text,
    });
    // bullet items
    let y = colY + 140;
    cols[i].items.forEach((it) => {
      const lines = wrap(it, font, 10, colW - 24);
      lines.forEach((ln) => {
        page.drawText("• " + ln, { x: cx + 12, y, size: 10, font, color: DARK.sub });
        y -= 14;
      });
      y -= 4;
    });
  }

  // footer
  const footer = "Powered by corAe OS² — OneStructure™";
  const fw = font.widthOfTextAtSize(footer, 9);
  page.drawText(footer, {
    x: (width - fw) / 2, y: 20, size: 9, font, color: DARK.sub,
  });

  const bytes = await doc.save();
  return new Uint8Array(bytes);
}

// simple text wrapper for bullets
function wrap(text: string, font: any, size: number, maxW: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, size) <= maxW) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}