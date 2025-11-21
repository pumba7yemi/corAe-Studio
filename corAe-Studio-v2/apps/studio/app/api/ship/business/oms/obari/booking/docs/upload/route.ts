// OBARI — Booking Document Upload (150.logic, Windows-first)
// POST multipart/form-data: file, bookingId, kind(POD|WTN|INV|OTHER), [status], [notes]

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Accept only these doc kinds; mirrors BookingDocType enum
const DOC_KINDS = new Set(["POD", "WTN", "INV", "OTHER"] as const);
type DocKind = "POD" | "WTN" | "INV" | "OTHER";

// Optional explicit status; mirrors DocStatus enum
const DOC_STATUS = new Set(["REQUIRED", "PENDING", "RECEIVED", "VERIFIED", "REJECTED"] as const);
type DocStatus = "REQUIRED" | "PENDING" | "RECEIVED" | "VERIFIED" | "REJECTED";

function sanitizeFilename(name: string) {
  // Keep it simple/cross-platform; strip odd chars
  return name.replace(/[^\w.\-]+/g, "_");
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const bookingId = String(form.get("bookingId") || "").trim();
    const kindStr = String(form.get("kind") || "").trim().toUpperCase();
    const statusStr = String(form.get("status") || "").trim().toUpperCase();
    const notes = String(form.get("notes") || "").trim() || undefined;

    const file = form.get("file");

    if (!bookingId) {
      return NextResponse.json({ ok: false, error: "bookingId required" }, { status: 400 });
    }
    if (!file || typeof file === "string") {
      return NextResponse.json({ ok: false, error: "file required" }, { status: 400 });
    }

    const kind = (DOC_KINDS.has(kindStr as DocKind) ? (kindStr as DocKind) : "OTHER") as DocKind;
    const status = (DOC_STATUS.has(statusStr as DocStatus) ? (statusStr as DocStatus) : "REQUIRED") as DocStatus;

    // Ensure booking exists
    const booking = await prisma.obariBooking.findUnique({
      where: { id: bookingId },
      select: { id: true, bookingRef: true },
    });
    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }

    // Save file to a dev-local uploads folder within the repo (ignored by Git ideally)
    // Path: <repoRoot>/apps/studio/.uploads/booking/<bookingId>/<filename>
    const repoRoot = resolve(process.cwd()); // workspace root
    const uploadsRoot = resolve(repoRoot, "apps/studio/.uploads/booking", bookingId);

    const blob = file as File;
    const origName = sanitizeFilename(blob.name || "upload.bin");

    await mkdir(uploadsRoot, { recursive: true });
    const absPath = resolve(uploadsRoot, origName);
    const arrayBuffer = await blob.arrayBuffer();
    await writeFile(absPath, Buffer.from(arrayBuffer));

    // Persist DocumentationPhase row; store local path as "local:<abs>"
    const doc = await prisma.documentationPhase.create({
      data: {
        bookingId: booking.id,
        kind,                // BookingDocType
        status,              // DocStatus
        fileNodeId: `local:${absPath}`, // local dev pointer; FileLogic bridge later
        notes,
        receivedAt: status === "RECEIVED" || status === "VERIFIED" ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      doc,
      file: {
        savedAs: absPath,
        bookingRef: booking.bookingRef,
        kind,
        status,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
