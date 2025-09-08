import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'corAe',
  description: 'corAe — Mothership',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {/* Top Nav */}
          <nav className="site-nav">
            <Link href="/">corAe</Link>
            <div style={{ flex: 1 }} />
            <Link href="/caia">CAIA</Link>
            <Link href="/cims">CIMS</Link>
            <Link href="/dockyard">Dockyard</Link>
            <Link href="/ship">Ship</Link>
          </nav>

          <main className="stack">{children}</main>
        </div>
      </body>
    </html>
  );
}