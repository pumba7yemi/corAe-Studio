export const metadata = {
  title: "corAe Studio",
  description: "Baseline Next.js app is running.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, Arial, sans-serif" }}>
        <header style={{ borderBottom: "1px solid #eee", padding: "16px 24px" }}>
          <a href="/" style={{ fontWeight: 700, fontSize: 20, textDecoration: "none", color: "black" }}>
            corAe Studio
          </a>
          <nav style={{ marginTop: 8 }}>
            <a href="/dashboard" style={{ marginRight: 16 }}>Dashboard</a>
            <a href="/projects" style={{ marginRight: 16 }}>Projects</a>
            <a href="/clients" style={{ marginRight: 16 }}>Clients</a>
            <a href="/settings">Settings</a>
          </nav>
        </header>
        <main style={{ padding: 24 }}>{children}</main>
        <footer style={{ borderTop: "1px solid #eee", padding: 16, textAlign: "center", color: "#666" }}>
          © {new Date().getFullYear()} corAe
        </footer>
      </body>
    </html>
  );
}