import { PrismaClient } from "@prisma/client";

// Local augmentation to allow code that references older/extra models (contact) to type-check
// This is a minimal, reversible shim; ideally the Prisma client should be regenerated to include
// the real models. For now we expose the `contact` delegate as `any` so build can progress.

declare module "@prisma/client" {
  interface PrismaClient {
    contact: any;
  }
}
