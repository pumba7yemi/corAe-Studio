// src/lib/caia/brain.ts

export type DailyMessage = {
  id: string;
  channel: "cims" | "email";
  to?: string;           // for email
  subject?: string;      // for email
  body: string;
};

export async function composeDailyMessages(opts?: { date?: string }): Promise<DailyMessage[]> {
  const when = opts?.date ?? new Date().toISOString().slice(0, 10);

  return [
    {
      id: `brief-${when}`,
      channel: "cims",
      body: `CAIA Daily Brief for ${when}: sales trending +6.2%, 2 expiry alerts, PepsiCo PO due 15:00.`,
    },
    {
      id: `ops-${when}`,
      channel: "email",
      to: "ops@example.com",
      subject: `Operations brief – ${when}`,
      body: `Heads-up:\n• Pricelock variance watch on PepsiCo\n• Chiller temp check by 10:00\n• Two expiries to assign`,
    },
  ];
}