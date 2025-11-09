// lightweight shape refs (can be replaced by zod later)
export const Schema = {
  Order: ["id","customerId","amount","currency","createdAt"] as const,
  Booking: ["id","orderId","status","scheduledFor","createdAt"] as const,
  ActiveItem: ["id","type","refId","startedAt"] as const,
  ReportRow: ["id","kind","period","total"] as const,
  Invoice: ["id","orderId","subtotal","tax","total","issuedAt"] as const,
};