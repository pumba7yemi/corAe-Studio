export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="wa-number" content="9715XXXXXXX" />
        {/* favicon, og:image, etc. */}
      </head>
      <body>{children}</body>
    </html>
  );
}