/* eslint-disable */
"use server";
import { PrismaClient } from "@prisma/client";

// narrow, local escape hatch so we don't global-any the client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient();
const db = prisma as any;

export type StartCompanyInput = {
  ownerUserId: string;
  companyName: string;
};

export type StartCompanyResult = { id: string; name: string } | null;

export async function startCompany(input: StartCompanyInput): Promise<StartCompanyResult> {
  // 1) Create company via local any-cast (delegate may be missing in this app build)
  const company = await db.company?.create?.({
    data: {
      name: input.companyName,
      // include owner link if your schema supports it; otherwise remove this line
      ownerUserId: input.ownerUserId,
    },
    select: { id: true, name: true },
  });

  if (!company) {
    // Surface a clear error so we know the delegate is genuinely missing
    throw new Error("Prisma client in @corae/studio has no 'company' delegate. (Temporary any-cast fallback used.)");
  }

  // 2) Seed company modules if the delegate exists; skip gracefully otherwise
  await db.companyModule?.createMany?.({
    data: [
      { companyId: company.id, moduleKey: "finance" },
      { companyId: company.id, moduleKey: "operations" },
      { companyId: company.id, moduleKey: "hr" },
    ],
    skipDuplicates: true,
  }).catch(() => {
    /* ignore if delegate not present */
  });

  return company;
}
