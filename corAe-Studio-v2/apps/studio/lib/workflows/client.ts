export async function getInstance(id: string): Promise<any> {
  const res = await fetch(`/api/workflows/${id}`);
  if (!res.ok) throw new Error('Failed to fetch workflow instance');
  return res.json();
}

export async function approveStep(id: string): Promise<void> {
  const res = await fetch(`/api/workflows/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to approve step');
}
