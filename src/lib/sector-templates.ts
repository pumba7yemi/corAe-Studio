// src/lib/sector-templates.ts
// Sector-level defaults for corAe and white-label systems.
// Extend with new sectors (e.g. clinic, education, logistics) as needed.

export type SectorTemplate = {
  id: string;                 // e.g. "salon", "retail.supermarket", "hotel"
  title: string;              // Human-readable title
  defaults: {
    theme: { primary: string; secondary?: string };
    manifesto: { whoMd: string; whatMd: string };
    modules: string[];
    badges: string[];
  };
  config?: Record<string, unknown>;
};

export const sectorTemplates: Record<string, SectorTemplate> = {
  salon: {
    id: "salon",
    title: "Salon OS",
    defaults: {
      theme: { primary: "#E65A8D" },
      manifesto: {
        whoMd:
          "We are a system for salons: structure for bookings, stylists, and client care.",
        whatMd:
          "Booking, stylist rosters, product tracking, POS, and finance — all in one flow, powered by corAe OS²."
      },
      modules: ["booking", "stylists", "inventory", "pos", "finance"],
      badges: ["corAe Checked™", "Pricelock Chain™"]
    }
  },

  "retail.supermarket": {
    id: "retail.supermarket",
    title: "Supermarket OS",
    defaults: {
      theme: { primary: "#111827" },
      manifesto: {
        whoMd:
          "We are a system for supermarkets: structure for category control, stock, and vendor management.",
        whatMd:
          "28-day vendor cycle, expiry tracking, reorder logic, and POS sync — built for precision and powered by corAe OS²."
      },
      modules: ["catalog", "pos", "purchasing", "finance", "expiry", "vendor-cycle"],
      badges: ["corAe Checked™", "Pricelock Chain™"]
    }
  },

  hotel: {
    id: "hotel",
    title: "Hotel OS",
    defaults: {
      theme: { primary: "#0D5B85" },
      manifesto: {
        whoMd:
          "We are a system for hotels: connecting rooms, guests, and service teams under one structure.",
        whatMd:
          "Bookings, housekeeping, maintenance, and finance — synchronised through corAe’s intelligent hospitality core."
      },
      modules: ["rooms", "rates", "availability", "housekeeping", "pos", "finance", "cims", "workfocus"],
      badges: ["corAe Checked™", "Pricelock Chain™"]
    }
  }
};