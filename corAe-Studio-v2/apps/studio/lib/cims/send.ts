// Minimal transport for CIMS — replace with real gateway later.
export type CimsMessage = {
  channel?: "CIMS" | "Push" | "Email" | "SMS" | "Voice";
  title: string;
  body: string;
  at?: string; // ISO
  meta?: Record<string, unknown>;
};

export async function sendToCIMS(msgs: CimsMessage[] | CimsMessage) {
  const list = Array.isArray(msgs) ? msgs : [msgs];
  // lightweight stub — log and resolve
  // In production replace with real HTTP call to CIMS gateway
  // Keep this synchronous-looking and safe at build/prerender time.
  // eslint-disable-next-line no-console
  console.log("[CIMS:stub]", list.length, "message(s)", list);
  return { ok: true };
}

export const SENDERS = {
  cims: async (payload: any) => ({ ok: true, sent: true, channel: 'cims', payload }),
};
