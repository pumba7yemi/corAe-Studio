// Default = Biz (OMS)
export { prismaBiz as prisma } from "./dbBiz";

// Core / 150 for system-level ops
export { prisma150 as prismaCore } from "./db150";

// Optional default export (Biz)
import { prismaBiz } from "./dbBiz";
export default prismaBiz;
console.log("✅ prismaCore + prismaBiz loaded");

import { PrismaClient } from "@prisma/client";

declare global {
  var __db: PrismaClient | undefined;
}

export const db =
  globalThis.__db ?? new PrismaClient();

if (!globalThis.__db) globalThis.__db = db;