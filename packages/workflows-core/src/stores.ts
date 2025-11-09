export async function saveInstance(data: any)  { return { id: crypto.randomUUID(), ...data, spec: await loadSpec(data.specId) }; }
export async function loadInstance(id: string) { /* load by id; include spec */ return {} as any; }
export async function updateInstance(id: string, patch: any) { /* persist */ }
async function loadSpec(specId: string) { /* fetch JSON spec by id from /specs */ return {} as any; }
