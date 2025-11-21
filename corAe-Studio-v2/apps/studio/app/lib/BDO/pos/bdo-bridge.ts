// app/studio/app/lib/BDO/pos/bdo-bridge.ts
/* ============================================================
   corAe POS → BDO Bridge (Unified Library)
   - Triggered by POS sales or stock depletion
   - Creates a Brokered Deal Order (BDO)
   - Feeds OBARI → Finance automatically
   ============================================================ */

export type POSProduct = {
  sku: string;
  name: string;
  vendorCode?: string;
  qty: number;
  price: number;
  tax?: number;
};

export type BDOType = "SALES" | "PURCHASE";

export interface BDOPayload {
  type: BDOType;
  stage: "ORDER_READY";
  products: POSProduct[];
  customerCode?: string;
  supplierCode?: string;
  sourceRef?: string;
  note?: string;
}

/** Mock API call (to be replaced with Prisma endpoint later) */
async function createBDO(payload: BDOPayload) {
  const res = await fetch("/api/bdo/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "BDO creation failed");
  return data;
}

/** POS → BDO (Sales order) */
export async function handleSaleToBDO(items: POSProduct[], customerCode?: string) {
  try {
    const payload: BDOPayload = {
      type: "SALES",
      stage: "ORDER_READY",
      products: items,
      customerCode,
      sourceRef: `POS-${Date.now()}`,
      note: "Auto-created from POS Till",
    };
    const bdo = await createBDO(payload);
    console.info("✅ BDO created from POS sale:", bdo.code);
    return bdo;
  } catch (err) {
    console.error("❌ Failed to create BDO:", err);
  }
}

/** Auto Purchase BDO (low stock trigger) */
export async function handleReorderToBDO(product: POSProduct, supplierCode?: string) {
  try {
    const payload: BDOPayload = {
      type: "PURCHASE",
      stage: "ORDER_READY",
      products: [product],
      supplierCode,
      sourceRef: `AUTO-REORDER-${product.sku}-${Date.now()}`,
      note: "Auto-generated from low stock trigger",
    };
    const bdo = await createBDO(payload);
    console.info("📦 Purchase BDO created:", bdo.code);
    return bdo;
  } catch (err) {
    console.error("❌ Failed to auto-create Purchase BDO:", err);
  }
}
