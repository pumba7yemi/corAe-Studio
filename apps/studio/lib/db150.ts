import { PrismaClient } from "../generated/core";

const g = globalThis as unknown as { prisma150?: PrismaClient };

export const prisma150 =
  g.prisma150 ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") g.prisma150 = prisma150;

export default prisma150;
