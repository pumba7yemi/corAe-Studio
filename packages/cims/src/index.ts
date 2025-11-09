import { PrismaClient } from "@prisma/client";
import { extractFeatures, similarity, signatureOf } from "./feature-engine";
import { CORRESPOND_THRESHOLDS } from "./config";

const CORRESPOND_DEFAULTS = {
  TONE: "neutral",
  FOOTER: ""
};
import type { EmailLike } from "./types";
import type { TenantContext } from "./scope";

type Decision =
  | { mode: "AUTO_SAME"; templateId: number; templateText: string }
  | { mode: "DUAL"; templateId?: number | null; templateText?: string | null; freshDraft: string }
  | { mode: "FRESH_ONLY"; freshDraft: string };

export const prisma: any = new PrismaClient();

/**
 * Ingest an inbound email and decide the response path
 */
export async function processInboundEmail(email: EmailLike, ctx: TenantContext): Promise<Decision> {
  const features = extractFeatures(email);
  const signature = signatureOf(features);

  const existing = await prisma.correspondTemplate.findFirst({
    where: {
      signature,
      OR: [
        { scope: ctx.scope as any, orgId: ctx.orgId ?? undefined, householdId: ctx.householdId ?? undefined },
        { isShared: true, orgId: ctx.orgId ?? undefined },
        { isShared: true, householdId: ctx.householdId ?? undefined }
      ]
    }
  });

  if (existing && existing.autoMode)
    return { mode: "AUTO_SAME", templateId: existing.id, templateText: existing.text };

  // nearest snapshot
  const snaps = await prisma.correspondSnapshot.findMany({ take: 250, orderBy: { createdAt: "desc" } });
  let bestScore = 0; let best: any = null;
  for (const s of snaps) {
    const sc = similarity(features, (s.features as number[]) ?? []);
    if (sc > bestScore) { bestScore = sc; best = s; }
  }

  if (best && bestScore >= CORRESPOND_THRESHOLDS.EXACT_MATCH) {
    const tpl = await prisma.correspondTemplate.findFirst({ where: { signature: best.signature } });
    if (tpl) return { mode: "AUTO_SAME", templateId: tpl.id, templateText: tpl.text };
  }

  if (best && bestScore >= CORRESPOND_THRESHOLDS.CLOSE_MATCH) {
    const tpl = await prisma.correspondTemplate.findFirst({ where: { signature: best.signature } });
    return { mode: "DUAL", templateId: tpl?.id, templateText: tpl?.text, freshDraft: draft(email) };
  }

  return { mode: "FRESH_ONLY", freshDraft: draft(email) };
}

/** Save a confirmed reply and learn from it */
export async function confirmResponse(signature: string, text: string, ctx: TenantContext, wasEdited = false) {
  let tpl = await prisma.correspondTemplate.findFirst({
    where: { signature, scope: ctx.scope as any, orgId: ctx.orgId ?? undefined, householdId: ctx.householdId ?? undefined }
  });
  if (!tpl) {
    tpl = await prisma.correspondTemplate.create({
      data: { signature, text, toneProfile: CORRESPOND_DEFAULTS.TONE, scope: ctx.scope as any, orgId: ctx.orgId ?? null, householdId: ctx.householdId ?? null }
    });
  }
  if (!wasEdited) {
    await prisma.correspondAutoConfirmRule.upsert({
      where: { signature },
      update: { approvals: { increment: 1 } },
      create: { signature, approvals: 1, scope: ctx.scope as any }
    });
  }
  return tpl.id;
}

/** Compose a polite default draft */
function draft(email: EmailLike): string {
  return `Hi,

Thanks for reaching out regarding "${email.subject}". We’ve received your message and will get back to you shortly.

${CORRESPOND_DEFAULTS.FOOTER}`;
}