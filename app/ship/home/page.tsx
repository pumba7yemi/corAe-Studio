'use client';
import CaiaCard from '@/components/CaiaCard';

export default function ShipHomeSection() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">🏠 Home</h1>
      <p className="opacity-70">Personal hub — routines, pantry, wellness, 3cuDTD diary.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4 shadow">
          <h2 className="font-medium">Today’s Routine</h2>
          <ul className="text-sm mt-2 list-disc ml-4">
            <li>Morning walk with Grogu</li>
            <li>Lemon water + coffee</li>
            <li>Check fridge/pantry stock</li>
          </ul>
        </div>
        <div className="rounded-xl border p-4 shadow">
          <h2 className="font-medium">Reminders</h2>
          <ul className="text-sm mt-2 list-disc ml-4">
            <li>Bill payment due Friday</li>
            <li>Rotate frozen meat stock</li>
          </ul>
        </div>
      </div>

      <CaiaCard href="/ship/caia" label="🧠 CAIA (Ship)" subtitle="Home-aware assistant" />
    </div>
  );
}