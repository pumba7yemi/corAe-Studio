// apps/studio/lib/agent/dealStore.ts
type Deal = {
  id: string;
  vendor: string;
  terms?: string;
  priceLock?: boolean;
};

const mockDeals: Deal[] = [
  { id: 'demo-1', vendor: 'Iffco', terms: 'Weekly delivery', priceLock: true },
  { id: 'demo-2', vendor: 'PepsiCo', terms: 'Biweekly Sat', priceLock: false },
];

export async function getDealById(id: string): Promise<Deal | null> {
  return mockDeals.find(d => d.id === id) || null;
}