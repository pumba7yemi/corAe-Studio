// lib/wizard/adapters/prisma.ts
import { PrismaClient } from "@prisma/client";
import type { LoadResult, SaveResult, StorageAdapter, WizardContext, WizardId } from "../wizard";

export class PrismaStorage implements StorageAdapter {
  private prisma: PrismaClient | null = null;
  public ready = false;

  constructor() {
    try {
      this.prisma = new PrismaClient();
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  private key(id: WizardId, tenantId?: string | null, userId?: string | null) {
    return {
      wizardId: id,
      tenantId: tenantId ?? "tenant",
      userId: userId ?? "user",
    };
  }

  async save(ctx: WizardContext): Promise<SaveResult> {
    if (!this.prisma) throw new Error("Prisma not ready");
    const updatedAt = new Date().toISOString();
    const data = {
      wizardId: ctx.wizardId,
      tenantId: ctx.tenantId ?? "tenant",
      userId: ctx.userId ?? "user",
      version: ctx.version,
      currentStep: ctx.currentStep,
      state: ctx.state as any,
      createdAt: ctx.createdAt,
      updatedAt,
    };

    await (this.prisma as any).wizardSession.upsert({
      where: {
        wizardId_tenantId_userId: this.key(ctx.wizardId, ctx.tenantId, ctx.userId),
      },
      update: {
        version: data.version,
        currentStep: data.currentStep,
        state: data.state,
        updatedAt: data.updatedAt,
      },
      create: data,
    });

    const saved: WizardContext = { ...ctx, updatedAt };
    return { savedAt: updatedAt, ctx: saved };
  }

  async load(wizardId: WizardId, tenantId?: string | null, userId?: string | null): Promise<LoadResult> {
    if (!this.prisma) return { ctx: null };
    const row = await (this.prisma as any).wizardSession.findUnique({
      where: { wizardId_tenantId_userId: this.key(wizardId, tenantId, userId) },
    });
    if (!row) return { ctx: null };
    const ctx: WizardContext = {
      wizardId: row.wizardId as WizardId,
      tenantId: row.tenantId,
      userId: row.userId,
      version: row.version,
      state: (row.state as any) ?? {},
      currentStep: row.currentStep,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return { ctx };
  }

  async clear(wizardId: WizardId, tenantId?: string | null, userId?: string | null): Promise<void> {
    if (!this.prisma) return;
    await (this.prisma as any).wizardSession.delete({
      where: { wizardId_tenantId_userId: this.key(wizardId, tenantId, userId) },
    }).catch(() => {});
  }
}

/**
 * Prisma schema (add to schema.prisma then `npx prisma migrate dev`)
 *
 * model WizardSession {
 *   wizardId  String
 *   tenantId  String
 *   userId    String
 *   version   Int
 *   currentStep String
 *   state     Json
 *   createdAt String
 *   updatedAt String
 *
 *   @@id([wizardId, tenantId, userId])
 *   @@map("wizard_sessions")
 * }
 */