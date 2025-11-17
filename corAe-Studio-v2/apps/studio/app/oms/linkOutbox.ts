// apps/studio/app/lib/oms/linkOutbox.ts
/**
 * OMS ↔ CIMS wire
 * Mirrors OutboundMessage(status="queued") → CimsOutbox with outboundId set.
 *
 * Usage:
 *   import { registerOmsOutboxMirroring } from "../../lib/oms/linkOutbox";
 *   registerOmsOutboxMirroring(prisma);
 *
 * Assumptions (already reconciled in your schema):
 *   model OutboundMessage { id String @id @default(cuid()) status String ... }
 *   model CimsOutbox      { id String @id @default(cuid()) outboundId String @unique status String ... }
 *
 * The middleware is idempotent and safe to register once per process.
 */

import type { PrismaClient, Prisma } from "@prisma/client";

let registered = false;

export function registerOmsOutboxMirroring(prisma: PrismaClient) {
  if (registered) return;
  registered = true;

  (prisma as any).$use(async (params: any, next: any) => {
    const result = await next(params);

    // Listen for OutboundMessage create/update where status becomes 'queued'
    if (params.model === "OutboundMessage" && (params.action === "create" || params.action === "update")) {
      // Find the new/current status value
      const newStatus: string | null =
        (result && typeof result === "object" && "status" in result ? (result as any).status : null) ??
        (params.args?.data?.status ?? null);

      const outboundId: string | null =
        (result && typeof result === "object" && "id" in result ? (result as any).id : null) ??
        (params.args?.where?.id ?? null);

      if (newStatus === "queued" && outboundId) {
        try {
          // If a CimsOutbox already exists for this outbound, do nothing
          const existing = await (prisma as any).cimsOutbox.findUnique({ where: { outboundId } });
          if (!existing) {
            await (prisma as any).cimsOutbox.create({
              data: {
                outboundId,
                status: "queued",
              },
            });
          } else {
            // keep status mirrored
            if (existing.status !== "queued") {
              await (prisma as any).cimsOutbox.update({
                where: { outboundId },
                data: { status: "queued" },
              });
            }
          }
        } catch (e) {
          // swallow to avoid interrupting primary write; log in dev if needed
          // console.error("OMS↔CIMS mirror error:", e);
        }
      }
    }

    return result;
  });
}