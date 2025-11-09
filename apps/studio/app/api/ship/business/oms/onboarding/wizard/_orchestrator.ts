// apps/studio/app/api/ship/business/oms/onboarding/wizard/_orchestrator.ts
import { prisma } from "@/lib/prisma";

export type ChronoScope = "GENERAL"|"WORKFLOWS"|"OPERATIONS"|"HR"|"FINANCE"|"MARKETING"|"SALES";

export async function afterStepSaved(args: {
  step: "btdo.intake" | "btdo.accept" | "bdo.booking-sheet";
  dealId: string;
  refId?: string | null;
  contactId?: string | null;
  message?: string;
  snapshot?: any;
  gatewayCheck?: { ok: boolean; missing: string[] };
}): Promise<"btdo.accept" | "bdo.pricelock" | "bdo.documentation" | "bdo.activate" | null> {
  // Chrono
  try {
    await (prisma as any).chrono.create({
      data: {
        scope: scopeFor(args.step),
        message: args.message || `Step saved: ${args.step}`,
        refType: "Deal",
        refId: args.dealId,
        dealId: args.dealId,
        meta: { refId: args.refId || null, contactId: args.contactId || null, snapshot: args.snapshot || null, gate: args.gatewayCheck || null },
      },
    });
  } catch {}

  // Decide next gate
  switch (args.step) {
    case "btdo.intake":       return "btdo.accept";
    case "btdo.accept":       return "bdo.pricelock";
    case "bdo.booking-sheet": return "bdo.documentation";
    default:                  return null;
  }
}

function scopeFor(step:string): ChronoScope {
  if (step.includes("intake")) return "SALES";
  if (step.includes("accept")) return "SALES";
  if (step.includes("booking")) return "OPERATIONS";
  return "GENERAL";
}