// apps/studio/app/lib/oms/sendSimulator.ts
/**
 * Send Simulator (demo)
 * - marks CimsOutbox as 'sent' or 'failed'
 * - retries move back to 'queued'
 */
import type { PrismaClient } from "@prisma/client";

export async function markOutboxSent(prisma: PrismaClient, outboxId: string) {
  await (prisma as any).cimsOutbox.update({ where: { id: outboxId }, data: { status: "sent", sentAt: new Date() } });
}

export async function markOutboxFailed(prisma: PrismaClient, outboxId: string, reason?: string) {
  await (prisma as any).cimsOutbox.update({ where: { id: outboxId }, data: { status: "failed", failReason: reason ?? "simulated" } });
}

export async function retryOutbox(prisma: PrismaClient, outboxId: string) {
  await (prisma as any).cimsOutbox.update({ where: { id: outboxId }, data: { status: "queued" } });
}