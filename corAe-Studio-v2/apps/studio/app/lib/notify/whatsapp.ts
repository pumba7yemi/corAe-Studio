// Safe WhatsApp notify stub — apps/studio/app/lib/notify/whatsapp.ts
// Purpose: lightweight, no-op placeholder for on-call notifications.
// Usage: import { notifyOnCall } from '~/app/lib/notify/whatsapp';
// NOTE: This file intentionally contains no credentials and no external network calls.

export type NotifyResult = { ok: true } | { ok: false; error: string };

export async function notifyOnCall(message: string): Promise<NotifyResult> {
  try {
    // Replace this with your real implementation that calls an external service.
    // Keep credentials out-of-repo (process.env or a secret manager).
    // For now, just log so CI / dev can see an invocation.
    // eslint-disable-next-line no-console
    console.log('[notifyOnCall][whatsapp] message:', message);

    // Simulate async work
    await Promise.resolve();

    return { ok: true };
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[notifyOnCall][whatsapp] failed', err);
    return { ok: false, error: String(err?.message || err) };
  }
}
