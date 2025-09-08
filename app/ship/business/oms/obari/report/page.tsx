// apps/studio/app/report/page.tsx
import { listReport } from '@/obari/store';

export default async function ReportPage() {
  const reports = await listReport();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Report</h1>
      <p className="text-gray-500 mb-4">GRV, expiry, adjustments, and notes.</p>
      <ul className="space-y-2">
        {reports.map((r:any)=>(
          <li key={r.id} className="p-3 rounded border border-[var(--border)] bg-[var(--panel)]">
            <div className="font-semibold">Order {r.orderId}</div>
            <div className="text-xs">GRV: {r.grvRef} • Expiry: {r.expiry ?? '—'}</div>
            <div className="text-xs">Adjustments: {r.adjustments?.length ?? 0}</div>
            <div className="text-xs">Notes: {r.notes ?? '—'}</div>
            <div className="text-xs text-gray-400">{r.createdAt}</div>
          </li>
        ))}
        {reports.length===0 && <li className="text-sm text-gray-500">Nothing reported yet.</li>}
      </ul>
    </div>
  );
}