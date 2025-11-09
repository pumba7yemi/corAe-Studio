export type PriceOption = {
  merchant: string;
  price: number;
  url: string;
  affiliateUrl: string;
};

export async function findPriceOptions(query: { title: string; hintUrl?: string }): Promise<PriceOption[]> {
  const { title } = query;
  const base = (title || "").toLowerCase();
  const hash = [...base].reduce((a, c) => a + c.charCodeAt(0), 0) % 100;

  const mock: PriceOption[] = [
    { merchant: "Amazon", price: 399 + (hash % 20), url: "https://example.com/amazon", affiliateUrl: "https://aff.corae/amazon" },
    { merchant: "Noon", price: 389 + (hash % 15), url: "https://example.com/noon", affiliateUrl: "https://aff.corae/noon" },
    { merchant: "Apple", price: 429 + (hash % 10), url: "https://example.com/apple", affiliateUrl: "https://aff.corae/apple" },
  ];
  return mock.sort((a, b) => a.price - b.price);
}
