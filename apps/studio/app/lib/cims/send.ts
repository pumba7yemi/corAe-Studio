// Minimal shim for cims/send used by studio API during build.
// Exports SENDERS with whatsapp/email/sms helpers so imports like
// import("@/app/lib/cims/send") succeed during build.

export type SendPayload = Record<string, any>;

export const SENDERS: Record<
  string,
  (payload: SendPayload) => Promise<{ ok: boolean; sent: boolean; channel: string; payload: SendPayload }>
> = {
  whatsapp: async (payload: SendPayload) => ({ ok: true, sent: true, channel: 'whatsapp', payload }),
  email: async (payload: SendPayload) => ({ ok: true, sent: true, channel: 'email', payload }),
  sms: async (payload: SendPayload) => ({ ok: true, sent: true, channel: 'sms', payload }),
};

export default SENDERS;

// Convenience named export used by some API routes. It forwards to the
// configured sender (defaults to whatsapp) and is intentionally lightweight
// so routes can call `sendToCIMS(payload)` during local dev and tests.
export async function sendToCIMS(payload: SendPayload) {
  // choose channel if provided, else default to whatsapp
  const channel = (payload?.channel as string) || 'whatsapp';
  const sender = SENDERS[channel] ?? Object.values(SENDERS)[0];
  return sender(payload);
}
