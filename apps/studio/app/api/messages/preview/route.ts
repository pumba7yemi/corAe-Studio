// apps/studio/app/api/messages/preview/route.ts
// Render a MessageTemplate into an OutboundMessage draft (or queued if no human approval required).
// POST { templateId: string, ctx?: Record<string, any> }

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// lightweight local types to avoid path alias issues in API layer
type MessageCtx = Record<string, any>;

// --- helpers ---------------------------------------------------------------

function getByPath(obj: any, path: string): any {
  if (!obj) return undefined;
  return path.split(".").reduce((acc, key) => (acc && key in acc ? acc[key] : undefined), obj);
}

function renderNotes(ctx: MessageCtx): string {
  const notes = ctx?.notes;
  if (Array.isArray(notes) && notes.length) {
    return `\n\nNotes:\n- ${notes.join("\n- ")}`;
  }
  return "";
}

function computeTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

/**
 * Replace [bracket.placeholders] using ctx lookups.
 * Special-cases:
 *  - [timeOfDay]: computed if not provided in ctx
 *  - [notes]: renders bullet list if ctx.notes is array
 *  - [brand.signature]: fallback to "— Team corAe"
 * Any unknown placeholder → empty string.
 */
function merge(template: string | null | undefined, ctx: MessageCtx): string {
  if (!template) return "";
  const withSpecials = (template as any)
    .replaceAll("[timeOfDay]", ctx?.timeOfDay ?? computeTimeOfDay())
    .replaceAll("[notes]", renderNotes(ctx))
    .replaceAll("[brand.signature]", getByPath(ctx, "brand.signature") ?? "— Team corAe");

    return withSpecials.replace(/\[([^\[\]]+)\]/g, (_m: string, path: string) => {
    const v = getByPath(ctx, path.trim());
    return v == null ? "" : String(v);
  });
}

// --- route -----------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const { templateId, ctx = {} } = (await req.json()) as { templateId?: string; ctx?: MessageCtx };

    if (!templateId || typeof templateId !== "string") {
      return NextResponse.json({ ok: false, error: "templateId is required" }, { status: 400 });
    }

    const t = await (prisma as any).messageTemplate.findUnique({
      where: { id: templateId },
    });

    if (!t) {
      return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });
    }
    if (!t.isActive) {
      return NextResponse.json({ ok: false, error: "Template is inactive" }, { status: 409 });
    }

    const subject = t.subject ? merge(t.subject, ctx) : null;
    const body = merge(t.body, ctx);

    const status = t.requiresHumanApproval ? "draft" : "queued";

    const draft = await (prisma as any).outboundMessage.create({
      data: {
        templateId: t.id,
        subject,
        body,
        audience: t.audience,
        channel: t.channel,
        status,
        ctx,
        createdBy: "caia",
      },
    });

    return NextResponse.json({ ok: true, draft });
  } catch (err) {
    console.error("POST /api/messages/preview error:", err);
    return NextResponse.json({ ok: false, error: "Failed to render message" }, { status: 500 });
  }
}
