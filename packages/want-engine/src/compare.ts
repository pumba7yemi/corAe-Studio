import { WantItem, CompareResult, Offer } from "./types";

function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

const SAMPLE_VENDORS = ["Store A", "Store B", "Merchant X", "DealZone", "QuickBuy"];

export async function compareOffers(items: WantItem[]): Promise<CompareResult[]> {
  // Very small deterministic-ish mock compare engine for MVP/demo.
  return items.map((item, idx) => {
    const base = item.desiredPrice ?? rand(10, 200);
    const offers: Offer[] = SAMPLE_VENDORS.slice(0, 3).map((v, i) => ({
      vendor: v,
      price: Math.round((base * (0.85 + i * 0.08) + rand(-5, 5)) * 100) / 100,
      currency: "USD",
      affiliateUrl: item.url ? `${item.url}?aff=${v.replace(/\s+/g, "").toLowerCase()}` : undefined,
      shipping: Math.round(rand(0, 10) * 100) / 100,
    }));

    // sort best price first
    offers.sort((a, b) => a.price - b.price);

    return { item, offers } as CompareResult;
  });
}

export default compareOffers;
