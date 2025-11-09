// apps/studio/lib/ui/components/Nav.tsx
import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
  { href: '/projects', label: 'Projects' },
  { href: '/settings', label: 'Settings' },
  { href: '/agent', label: 'Agent' },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 bg-[var(--panel)]/80 backdrop-blur border-b border-[var(--border)]">
      <nav className="mx-auto max-w-5xl px-4 h-12 flex items-center gap-4">
        <div className="font-semibold">corAe Studio</div>
        <div className="flex-1" />
        <ul className="flex items-center gap-3">
          {links.map(l => (
            <li key={l.href}>
              <Link className="text-sm hover:underline" href={l.href}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
