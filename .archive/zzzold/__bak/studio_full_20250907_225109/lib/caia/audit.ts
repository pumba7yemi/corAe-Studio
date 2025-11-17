export async function logEvent(kind: string, data: any) {
  // swap to DB later
  try {
    console.log("[CAIA]", new Date().toISOString(), kind, data);
  } catch {}
}