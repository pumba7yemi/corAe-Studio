import { listOrders } from '@/lib/obariStore';

export default async function OrdersPage() {
  const orders = await listOrders();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="text-gray-500 mb-4">Raw orders captured before booking.</p>
      <ul className="space-y-2">
        {orders.map((o:any)=>(
          <li key={o.id} className="p-3 rounded border border-[var(--border)] bg-[var(--panel)]">
            <div className="font-semibold">{o.vendor}</div>
            <div className="text-xs text-gray-400">Order #{o.id}</div>
            <div className="text-xs">Items: {o.items?.length ?? 0} • Deal: {o.dealId ?? '—'}</div>
            <div className="text-xs">Created: {o.createdAt}</div>
          </li>
        ))}
        {orders.length===0 && <li className="text-sm text-gray-500">No orders yet.</li>}
      </ul>
    </div>
  );
}