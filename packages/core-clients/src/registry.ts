// packages/core-clients/src/registry.ts
export type Client = { id: string; name: string; domains: string[]; signed: boolean };

const CLIENTS: Client[] = [
  { id: "choiceplus", name: "Choice Plus", domains: ["choiceplus.ae"], signed: true },
  // { id: "acme", name: "ACME Co", domains: ["acme.com"], signed: true },
];

export function findClientByEmailOrDomains(addresses: string[]): Client | null {
  const hay = addresses.join(" ").toLowerCase();
  for (const c of CLIENTS) {
    if (c.domains.some(d => hay.includes(`@${d}`) || hay.includes(d))) return c;
  }
  return null;
}

export function getClientById(id?: string | null): Client | null {
  if (!id) return null;
  return CLIENTS.find(c => c.id === id) ?? null;
}
