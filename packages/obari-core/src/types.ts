export type Order = {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  createdAt: string; // ISO
};

export type Booking = {
  id: string;
  orderId: string;
  status: "pending" | "confirmed" | "cancelled";
  scheduledFor?: string; // ISO
  createdAt: string; // ISO
};

export type ActiveItem = {
  id: string;
  type: "order" | "booking";
  refId: string;
  startedAt: string; // ISO
};

export type ReportRow = {
  id: string;
  kind: "daily" | "weekly" | "monthly";
  period: string; // e.g. 2025-09-19
  total: number;
};

export type Invoice = {
  id: string;
  orderId: string;
  subtotal: number;
  tax: number;
  total: number;
  issuedAt: string; // ISO
};