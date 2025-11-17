'use client';

import Link from 'next/link';

export default function ManagementCockpit() {
  const areas = [
    { href: 'caia', title: 'CAIA', desc: 'AI executive assistant — inbox, diary, follow-ups' },
    { href: 'scheduling', title: 'Scheduling', desc: 'Meetings, calendars, reminders' },
    { href: '../finance', title: 'Finance', desc: 'AR/AP, vendors, POs, GRVs' },
    { href: '../operations', title: 'Operations', desc: 'Daily workflows & SOP runner' },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Management Cockpit</h1>
      <p className="text-sm opacity-70">
        Central view for managers + CAIA — finance, ops, assistant tools, and scheduling.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map(i => (
          <Link
            key={i.href}
            href={`/ship/business/oms/management/${i.href}`}
            className="rounded-2xl p-4 shadow hover:shadow-md"
          >
            <h3 className="font-semibold">{i.title}</h3>
            <p className="text-sm opacity-70">{i.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
