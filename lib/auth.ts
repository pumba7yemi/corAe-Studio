// apps/studio/lib/auth.ts
export function getServerApiKey(): string {
  const k = process.env.STUDIO_API_KEY?.trim();
  if (!k) {
    throw new Error("STUDIO_API_KEY is not set. Put it in .env.local");
  }
  return k;
}

/** Throws 401 if invalid/missing */
export function assertApiKey(req: Request) {
  const incoming = req.headers.get('x-api-key')?.trim() || '';
  const server = getServerApiKey();
  if (!incoming || incoming !== server) {
    const e = new Error('Unauthorized');
    // @ts-ignore attach status
    (e as any).status = 401;
    throw e;
  }
}