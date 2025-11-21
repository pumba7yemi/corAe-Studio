// corAe Pulse Core v2
// Location: corAe-Studio-v2/packages/pulse-core-v2/index.ts

export type MetricTrend = "up" | "down" | "flat";

export interface PulseMetric {
  id: string;
  label: string;
  value: string;
  sublabel?: string;
  trend?: MetricTrend;
}

export interface PulseTimelineItem {
  id: string;
  time: string;      // e.g. "09:30"
  label: string;     // e.g. "PO transfer due"
  channel?: string;  // e.g. "Bank", "Vendor", "Staff"
}

export interface PulseSnapshotV2 {
  asOf: string;                // ISO
  businessTitle: string;
  metrics: PulseMetric[];
  timeline: PulseTimelineItem[];
}

export function getMockPulseSnapshot(): PulseSnapshotV2 {
  const now = new Date();
  return {
    asOf: now.toISOString(),
    businessTitle: "Choice Plus / corAe Demo Ship",
    metrics: [
      {
        id: "rev",
        label: "Revenue (Today)",
        value: "AED 12,450",
        sublabel: "vs 10,200 yesterday",
        trend: "up",
      },
      {
        id: "po",
        label: "POs Due Today",
        value: "2",
        sublabel: "cash required AED 6,200",
        trend: "flat",
      },
      {
        id: "cash",
        label: "Cash Position",
        value: "OK",
        sublabel: "meets today’s PO obligations",
        trend: "up",
      },
      {
        id: "alerts",
        label: "Open Alerts",
        value: "1",
        sublabel: "Vendor / Compliance",
        trend: "flat",
      },
    ],
    timeline: [
      {
        id: "t1",
        time: "09:00",
        label: "Review yesterday takings vs POS",
        channel: "Finance",
      },
      {
        id: "t2",
        time: "11:00",
        label: "Confirm PO payments & vendor slots",
        channel: "Vendors",
      },
      {
        id: "t3",
        time: "15:00",
        label: "Mid-day Pulse review with CAIA",
        channel: "CAIA",
      },
      {
        id: "t4",
        time: "19:30",
        label: "Close-down cash & compliance check",
        channel: "Close",
      },
    ],
  };
}
