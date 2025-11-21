// apps/studio/app/lib/company/bootstrap.ts
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
// startWorkflow is imported dynamically at runtime (typing mismatch with the package exports)
// @ts-ignore: allow importing JSON without type declarations
import obariConfig from "@corae/workflows-core/config/obari.automation.json";

export type StartCompanyInput = { ownerUserId: string; companyName: string };

export async function bootstrapCompany(input: StartCompanyInput) {
  if (!input?.ownerUserId || !input?.companyName) {
    throw new Error("ownerUserId and companyName are required");
  }
  // Create company + modules (one transaction)
  const result = await prisma.$transaction(async (tx: any) => {
    const company = await tx.company.create({
      data: {
        name: input.companyName.trim(),
        createdByUserId: input.ownerUserId,
      },
    });

    await tx.companyModule.createMany({
      data: [
        { companyId: company.id, moduleKey: "finance", enabled: true },
        { companyId: company.id, moduleKey: "operations", enabled: true },
        { companyId: company.id, moduleKey: "obari", enabled: true },
        { companyId: company.id, moduleKey: "hr", enabled: true },
        { companyId: company.id, moduleKey: "sales", enabled: true },
      ],
      skipDuplicates: true,
    });

    return { company };
  });

  // Kick off OBARI (PO/SO) workflow
  const ctx = {
    companyId: result.company.id,
    ownerUserId: input.ownerUserId,
    config: obariConfig,
  };
  // Dynamically import startWorkflow and cast to any to avoid TypeScript export mismatch
  const { startWorkflow } = (await import("@corae/workflows-core")) as any;
  const { instanceId } = await startWorkflow("finance.po-so.issue.v1", ctx);

  return { companyId: result.company.id, instanceId };
}