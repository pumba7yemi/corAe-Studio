// app/prisma/client.ts
import * as PrismaPkg from "@prisma/client";
const PrismaClient = (PrismaPkg as any).PrismaClient ?? (PrismaPkg as any).default ?? PrismaPkg;

const globalForPrisma = globalThis as unknown as { prisma?: InstanceType<typeof PrismaClient> };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;