import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client – 150-Logic Safe
 * Prevents multiple database connections during Next.js hot reloads.
 * Ensures singleton behaviour in both dev and production.
 */

const globalForPrisma = globalThis as any;

export const prisma: any =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

// Only assign once globally in dev
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}