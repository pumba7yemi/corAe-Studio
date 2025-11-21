"use client";

import EthosCard from "@/app/components/EthosCard";

export default function MaintenancePage() {
  return (
    <div className="p-6 space-y-4">
      <EthosCard />
      <h2 className="text-xl font-semibold">Home Maintenance</h2>
      <p>
        Track, schedule, and manage household maintenance — AC, plumbing,
        electrical, appliances, and all essential care tasks.
      </p>
    </div>
  );
}
