import { PrismaClient as PrismaBizClient } from "../generated/biz";

const g = globalThis as unknown as { prismaBiz?: PrismaBizClient };

export const prismaBiz =
  g.prismaBiz ??
  new PrismaBizClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") g.prismaBiz = prismaBiz;

export default prismaBiz;
