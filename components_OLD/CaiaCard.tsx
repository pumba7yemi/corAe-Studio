'use client';

import React from 'react';

type Props = {
  href: string;
  label?: string;
  subtitle?: string;
  className?: string;
};

export default function CaiaCard({
  href,
  label = '🧠 CAIA',
  subtitle = 'Always-on assistant',
  className = '',
}: Props) {
  return (
    <a
      href={href}
      className={`rounded-2xl border shadow p-6 hover:bg-gray-100 transition flex flex-col gap-2 ${className}`}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">{label}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </a>
  );
}