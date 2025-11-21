// apps/studio/app/lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";
// Import the local OMS link-outbox middleware and register it once per process.
import { registerOmsOutboxMirroring } from "../../oms/linkOutbox";

/**
 * Stable Prisma client for dev HMR + production.
 * Also registers the OMS↔CIMS mirroring middleware exactly once.
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  __omsWireRegistered?: boolean;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Register OMS wire once per process (guarded for HMR)
if (!globalForPrisma.__omsWireRegistered) {
  // Guard the middleware registration: ensure the client exposes $use before calling.
  // In some build/runtime bundling scenarios the imported object may not be the
  // full PrismaClient instance, so this avoids crashing the build step.
  if (typeof (prisma as any).$use === "function") {
    registerOmsOutboxMirroring(prisma);
    globalForPrisma.__omsWireRegistered = true;
  }
}

// Cache client in dev to avoid multiple instances across HMR
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;