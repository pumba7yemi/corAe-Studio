import { PrismaClient } from "@prisma/client";

// Prevent multiple PrismaClient instances in dev (Next.js hot reload)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["error", "warn"], // add "query" if you need debug detail
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;