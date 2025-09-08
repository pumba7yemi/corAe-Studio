import { listBookings } from '@/lib/obariStore';

export default async function BookingsPage() {
  const bookings = await listBookings();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Bookings</h1>
      <p className="text-gray-500 mb-4">Orders slotted into the 28-day cycle.</p>
      <ul className="space-y-2">
        {bookings.map((b:any)=>(
          <li key={b.id} className="p-3 rounded border border-[var(--border)] bg-[var(--panel)]">
            <div className="font-semibold">Order {b.orderId}</div>
            <div className="text-xs">Week {b.week}, Day {b.day}, Slot {b.slot}</div>
            <div className="text-xs text-gray-400">{b.createdAt}</div>
          </li>
        ))}
        {bookings.length===0 && <li className="text-sm text-gray-500">No bookings yet.</li>}
      </ul>
    </div>
  );
}