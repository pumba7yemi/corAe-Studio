import { listActive } from '@/obari/store';

export default async function ActivePage() {
  const active = await listActive();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Active</h1>
      <p className="text-gray-500 mb-4">Deliveries in progress.</p>
      <ul className="space-y-2">
        {active.map((a:any)=>(
          <li key={a.id} className="p-3 rounded border border-[var(--border)] bg-[var(--panel)]">
            <div className="font-semibold">Order {a.orderId}</div>
            <div className="text-xs">ETA: {a.eta ?? '—'}</div>
            <div className="text-xs text-gray-400">{a.createdAt}</div>
          </li>
        ))}
        {active.length===0 && <li className="text-sm text-gray-500">None active.</li>}
      </ul>
    </div>
  );
}