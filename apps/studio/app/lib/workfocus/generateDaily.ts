// apps/studio/app/lib/workfocus/generateDaily.ts
/**
 * Daily Instance Generator
 * Creates today's WorkflowInstance for each WorkflowTemplate.
 * Idempotent per (template, day). Call from a cron/API.
 */
import type { PrismaClient } from "@prisma/client";

export async function generateTodayInstances(prisma: PrismaClient, opts?: { orgId?: string | null }) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const ymd = `${yyyy}-${mm}-${dd}`;

  const templates = await (prisma as any).workflowTemplate.findMany({
    where: opts?.orgId ? { orgId: opts.orgId } : {},
    select: { id: true, slug: true, name: true, json: true },
  });

  const created: string[] = [];

  for (const t of templates) {
    // unique by (templateId + date)
    const key = `${t.id}::${ymd}`;
    const existing = await (prisma as any).workflowInstance.findFirst({
      where: { templateId: t.id, dateKey: ymd },
      select: { id: true },
    });
    if (existing) continue;

    await (prisma as any).workflowInstance.create({
      data: {
        templateId: t.id,
        dateKey: ymd,
        name: `${t.name} — ${ymd}`,
        json: t.json, // copy as starting checklist
        status: "pending",
        orgId: opts?.orgId ?? null,
      },
    });
    created.push(t.slug);
  }

  return { date: ymd, created };
}