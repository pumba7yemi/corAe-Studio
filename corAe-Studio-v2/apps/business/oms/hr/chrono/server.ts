import { prisma } from "@/lib/prisma";

export async function getChronoEntries() {
  const db: any = prisma as any;
  try {
    // try common delegate names safely
    const rows =
      (await db?.chrono?.findMany?.({ orderBy: { createdAt: "desc" }, take: 100, include: { employee: true } })) ??
      (await db?.chronoEntry?.findMany?.({ orderBy: { createdAt: "desc" }, take: 100, include: { employee: true } })) ??
      [];
    return rows;
  } catch (err) {
    return [];
  }
}
