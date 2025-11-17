// apps/studio/lib/caiaMemory.ts

import { prisma } from "../lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Unified memory helpers for CAIA.
 *
 * KV  (ROM-ish): table `caia_memory` (model CaiaMemory)
 *  - addressed by (scope, key)
 *  - value column is Prisma Json -> use Prisma.InputJsonValue for writes
 *
 * RAM (learned): table `LearnedMemory`
 *  - addressed by (tenantId, subject=key)
 *  - content column is string; we store JSON as string
 */

// ----------------------------- Types -----------------------------

/** Valid JSON input for CaiaMemory.value */
export type MemoryValueKV = Prisma.InputJsonValue;

/** Any value that will be stringified for LearnedMemory.content */
export type MemoryValueRAM = unknown;

// ----------------------------- KV (CaiaMemory) -----------------------------

export const KV = {
  /** Get a JSON value from (scope,key). Returns the raw JSON value or null. */
  async get(scope: string, key: string) {
    const row = await (prisma as any).caiaMemory.findUnique({
      where: { scope_key: { scope, key } }, // relies on @@unique([scope, key])
      select: { value: true },
    });
    // value is already JSON from Prisma -> return as-is
    return row?.value ?? null;
  },

  /** Upsert a JSON value at (scope,key). */
  async set(scope: string, key: string, value: MemoryValueKV) {
    await (prisma as any).caiaMemory.upsert({
      where: { scope_key: { scope, key } },
      update: { value },
      create: { scope, key, value },
    });
  },

  /** List all entries for a scope. */
  async list(scope: string) {
    return (prisma as any).caiaMemory.findMany({
      where: { scope },
      orderBy: { updatedAt: "desc" },
      select: { scope: true, key: true, value: true, updatedAt: true, createdAt: true },
    });
  },

  /** Delete a single entry; no-throw if missing. */
  async del(scope: string, key: string) {
    await (prisma as any).caiaMemory
      .delete({ where: { scope_key: { scope, key } } })
      .catch(() => {});
  },
};

// ----------------------------- RAM (LearnedMemory) -----------------------------

export const RAM = {
  /**
   * Get a value from (tenantId,key).
   * We store JSON as string in `content`; this returns parsed JSON if possible,
   * otherwise the raw string.
   */
  async get(tenantId: string, key: string) {
    const row = await (prisma as any).learnedMemory.findFirst({
      where: { tenantId, subject: key },
      orderBy: { createdAt: "desc" }, // LearnedMemory has createdAt (not updatedAt)
      select: { content: true },
    });
    if (!row?.content) return null;
    try {
      return JSON.parse(row.content);
    } catch {
      return row.content;
    }
  },

  /**
   * Upsert a value at (tenantId,key).
   * Anything is accepted; it is stringified for storage.
   */
  async set(tenantId: string, key: string, value: MemoryValueRAM) {
    const content =
      typeof value === "string" ? value : JSON.stringify(value);

    const existing = await (prisma as any).learnedMemory.findFirst({
      where: { tenantId, subject: key },
      select: { id: true },
    });

    if (existing) {
      await (prisma as any).learnedMemory.update({
        where: { id: existing.id },
        data: { content },
      });
    } else {
      await (prisma as any).learnedMemory.create({
        data: {
          tenantId,
          subject: key,
          content,
          kind: "note",       // change to "fact" if you prefer
          importance: 1,
          source: "system",
        },
      });
    }
  },

  /** List all learned entries for a tenant (newest first). */
  async list(tenantId: string) {
    return (prisma as any).learnedMemory.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: { subject: true, content: true, createdAt: true, kind: true, tags: true },
    });
  },

  /** Delete one key from a tenant’s learned memory. */
  async del(tenantId: string, key: string) {
    await (prisma as any).learnedMemory.deleteMany({
      where: { tenantId, subject: key },
    });
  },
};

// ----------------------------- Optional unified router -----------------------------

type Backend = "kv" | "ram";

/**
 * If you want a single entry-point that routes by env:
 *   CORAE_MEMORY_BACKEND = "kv" | "ram"   (default "kv")
 *
 * KV uses (scope,key)  -> pass tenantOrScope as *scope*.
 * RAM uses (tenantId,key) -> pass tenantOrScope as *tenantId*.
 */
const BACKEND: Backend =
  (process.env.CORAE_MEMORY_BACKEND as Backend) || "kv";

export async function getMemory(tenantOrScope: string, key: string) {
  return BACKEND === "ram"
    ? RAM.get(tenantOrScope, key)
    : KV.get(tenantOrScope, key);
}

export async function setMemory(
  tenantOrScope: string,
  key: string,
  // accept both types; narrow at call site depending on backend
  value: MemoryValueKV | MemoryValueRAM
) {
  if (BACKEND === "ram") {
    return RAM.set(tenantOrScope, key, value as MemoryValueRAM);
  }
  return KV.set(tenantOrScope, key, value as MemoryValueKV);
}

export async function listMemory(tenantOrScope: string) {
  return BACKEND === "ram"
    ? RAM.list(tenantOrScope)
    : KV.list(tenantOrScope);
}

export async function delMemory(tenantOrScope: string, key: string) {
  return BACKEND === "ram"
    ? RAM.del(tenantOrScope, key)
    : KV.del(tenantOrScope, key);
}
