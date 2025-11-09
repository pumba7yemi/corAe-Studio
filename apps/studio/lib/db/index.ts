// apps/studio/lib/db/index.ts
import * as Prisma from "@prisma/client";
declare global { var _prisma: Prisma.PrismaClient | undefined }
export const prisma = global._prisma ?? new Prisma.PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
if (process.env.NODE_ENV !== "production") global._prisma = prisma;