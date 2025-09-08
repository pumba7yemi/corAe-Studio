import "./globals.css";

export const metadata = {
  title: "corAe Studio",
  description: "Dockyard + Ship + CAIA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const link = "px-3 py-2 rounded-lg hover:bg-slate-100";
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <header className="border-b bg-white">
          <nav className="ca-wrap flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">corAe</span>
              <span className="text-xs px-2 py-1 rounded-full border bg-slate-50">Studio</span>
            </div>
            <div className="flex items-center gap-1">
              <a className={link} href="/">Home</a>
              <a className={link} href="/dockyard">Dockyard</a>
              <a className={link} href="/ship">Ship</a>
              <a className={link} href="/caia">CAIA</a>
              <a className={link} href="/business">Business</a>
              <a className={link} href="/work">Work</a>
              <a className={link} href="/home">Home</a>
            </div>
          </nav>
        </header>
        <main className="ca-wrap">{children}</main>
      </body>
    </html>
  );
}