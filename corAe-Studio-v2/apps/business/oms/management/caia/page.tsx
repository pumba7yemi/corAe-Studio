'use client';

import Link from 'next/link';

export default function CAIAHub() {
  const links = [
    { href: 'inbox', label: 'Inbox', desc: 'Messages, vendor/customer requests, comms' },
    { href: 'diary', label: 'Diary', desc: '3cDTD tasks + Have you?/If notâ€¦ loops' },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">CAIA â€” Executive Assistant</h1>
      <p className="text-sm opacity-70">AI-backed executive assistant embedded in OMS.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map(l => (
          <Link
            key={l.href}
            href={`/business/oms/management/caia/${l.href}`}
            className="rounded-2xl p-4 shadow hover:shadow-md"
          >
            <h3 className="font-semibold">{l.label}</h3>
            <p className="text-sm opacity-70">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

