// apps/studio/app/business/layout.tsx
import Link from 'next/link';
import { buildNav } from '../../../src/caia/nav-builder';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const NAV = buildNav();
  return (
    <div className="space-y-4">
      <nav className="w-full border-b bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-6 text-[13px] text-gray-600">
          {NAV.business.map((n: any) => (
            <Link key={n.href} href={n.href} className="hover:text-black">
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
}

