// apps/studio/app/lib/BDO/obari/bdo-bridge.ts
/* ============================================================
   corAe OBARI → BDO Bridge
   - Keeps OBARI flows tied to their Brokered Deal Orders
   - Handles stage transitions: O → B → A → R → I
   - Updates BDO status + creates operational entries (Book, Report, Invoice)
   ============================================================ */

export type OBARIStage = "ORDER" | "BOOKING" | "ACTIVE" | "REPORTING" | "INVOICE";

export interface OBARIEventPayload {
  bdoId: string;
  stage: OBARIStage;
  scheduleId?: string;     // 28-day or monthly
  reference?: string;      // e.g. BK0001, INV0001
  notes?: string;
  actor?: string;          // CAIA, human user, or system agent
}

/** Mock API call (replace with Prisma endpoint later) */
async function updateBDOStage(payload: OBARIEventPayload) {
  const res = await fetch("/api/bdo/update-stage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "BDO stage update failed");
  return data;
}

/** Move a BDO to next OBARI stage */
export async function advanceBDOStage(
  bdoId: string,
  nextStage: OBARIStage,
  reference?: string,
  notes?: string
) {
  try {
    const payload: OBARIEventPayload = {
      bdoId,
      stage: nextStage,
      reference,
      notes,
      actor: "caia",
    };
    const result = await updateBDOStage(payload);
    console.info(`✅ BDO ${bdoId} advanced to ${nextStage}`, result);
    return result;
  } catch (err) {
    console.error(`❌ Failed to advance BDO ${bdoId} to ${nextStage}`, err);
  }
}

/** Rollback (for exception management only) */
export async function rollbackBDOStage(
  bdoId: string,
  previousStage: OBARIStage,
  reason?: string
) {
  try {
    const payload: OBARIEventPayload = {
      bdoId,
      stage: previousStage,
      notes: `Rollback: ${reason || "manual override"}`,
      actor: "caia",
    };
    const result = await updateBDOStage(payload);
    console.warn(`⚠️ BDO ${bdoId} rolled back to ${previousStage}`, result);
    return result;
  } catch (err) {
    console.error(`❌ Rollback failed for BDO ${bdoId}`, err);
  }
}

/** Full OBARI flow progression */
export const OBARI_FLOW: OBARIStage[] = [
  "ORDER",
  "BOOKING",
  "ACTIVE",
  "REPORTING",
  "INVOICE",
];

/** Helper to get the next logical stage */
export function getNextStage(current: OBARIStage): OBARIStage | null {
  const idx = OBARI_FLOW.indexOf(current);
  return idx >= 0 && idx < OBARI_FLOW.length - 1
    ? OBARI_FLOW[idx + 1]
    : null;
}
