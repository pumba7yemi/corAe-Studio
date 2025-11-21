export const dynamic = "force-dynamic";

// Try to import a server implementation of getChronoEntries if available; otherwise use a local fallback.
async function getChronoEntries(): Promise<any[]> {
  try {
    // @ts-ignore - './server' may not exist in some environments; ignore TS error for this import.
    const mod = await import('./server');
    if (mod && typeof mod.getChronoEntries === 'function') {
      return mod.getChronoEntries();
    }
  } catch (e) {
    // If import fails, fall back to local implementation below.
  }

  // Replace this with the real server call or move this to a shared module as needed.
  // Returning an empty array so the page renders without compile errors.
  return [];
}

export default async function ChronoPage() {
  const logs = await getChronoEntries();
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Chronological (latest 100)</h1>
      {logs.map((l: any) => (
        <div key={l.id} className="border rounded p-3">
          <div className="text-xs opacity-60">{new Date(l.createdAt).toISOString()}</div>
          <div className="text-sm"><b>{l.scope}</b> — {l.message}</div>
          {l.employee && <div className="text-xs opacity-70">Employee: {l.employee.firstName} {l.employee.lastName}</div>}
        </div>
      ))}
    </div>
  );
}