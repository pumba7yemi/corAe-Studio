// apps/studio/lib/ship/presets.ts

export type Vertical =
  | "supermarket"
  | "hotel"
  | "salon"
  | "fitness"
  | "cleaning";

export type Preset = {
  vertical: Vertical;
  label: string;
  modules: string[];
};

export const PRESETS: Record<Vertical, Preset> = {
  supermarket: {
    vertical: "supermarket",
    label: "Supermarket",
    modules: [
      "POS",
      "Inventory",
      "Loyalty",
      "Promotions",
      "Procurement",
      "Pricing",
      "Suppliers",
      "Analytics (Sales, Footfall)",
      "Staff Shifts",
      "Customer Service",
      "OBARI/Orders",
      "OBARI/Active",
      "OBARI/Invoicing",
      "OBARI/Report"
    ],
  },
  hotel: {
    vertical: "hotel",
    label: "Hotel",
    modules: [
      "Bookings/Rooms",
      "Housekeeping",
      "Front Desk",
      "Rates & Availability",
      "Payments/Invoices",
      "Loyalty",
      "Procurement",
      "Staff Shifts",
      "Analytics (ADR, RevPAR)",
      "OBARI/Bookings",
      "OBARI/Invoicing",
      "OBARI/Report"
    ],
  },
  salon: {
    vertical: "salon",
    label: "Salon",
    modules: [
      "Appointments",
      "POS",
      "Inventory (Products)",
      "Loyalty",
      "Staff Rosters",
      "Service Menu & Pricing",
      "Reminders/Notifications",
      "OBARI/Bookings",
      "OBARI/Orders",
      "OBARI/Report"
    ],
  },
  fitness: {
    vertical: "fitness",
    label: "Fitness App",
    modules: [
      "Memberships",
      "Check-ins",
      "Class Scheduling",
      "POS (Merch/Refreshments)",
      "Trainer Roster",
      "Programs/Plans",
      "Payments/Invoices",
      "OBARI/Bookings",
      "OBARI/Invoicing",
      "OBARI/Report"
    ],
  },
  cleaning: {
    vertical: "cleaning",
    label: "Cleaning",
    modules: [
      "Jobs & Scheduling",
      "Quoting",
      "Teams & Routes",
      "Invoicing & Payments",
      "Inventory (Supplies)",
      "Customer Hub",
      "OBARI/Bookings",
      "OBARI/Orders",
      "OBARI/Report"
    ],
  },
};

export type ShipBuildConfig = {
  brandType: "corae" | "white-label";
  vertical: Vertical;
  brandName?: string;
  modules: string[];
  ts: string;
};
