import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <header className='border-b'>
          <nav className='max-w-5xl mx-auto flex gap-4 p-4 text-sm'>
            <Link href='/'>Home</Link>
            <Link href='/dashboard'>Dashboard</Link>
            <Link href='/clients'>Clients</Link>
            <Link href='/projects'>Projects</Link>
            <Link href='/settings'>Settings</Link>
            <Link href='/agent' className='font-semibold'>Agent</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
