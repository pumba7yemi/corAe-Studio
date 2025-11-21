'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function DotNav({ area, pages }: { area: string; pages: { slug: string; title?: string }[] }) {
  const pathname = usePathname() || '/';

  return (
    <nav aria-label="Landing pages" className="mt-6 flex justify-center">
      <div className="flex gap-3">
        {pages.map((p) => {
          const href = `/landing/${area}/${p.slug}`;
          const active = pathname === href;
          return (
            <Link key={p.slug} href={href}>
              <span
                className={`block w-3 h-3 rounded-full transition-all ${
                  active ? 'bg-neutral-900 scale-110' : 'bg-neutral-300 hover:scale-105'
                }`}
                title={p.title ?? p.slug}
                aria-current={active ? 'page' : undefined}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
