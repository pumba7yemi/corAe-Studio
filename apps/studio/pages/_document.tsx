import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'

// Minimal custom Document to satisfy Next.js build requirements.
// Kept intentionally small and dependency-free to avoid import-resolution
// issues during the build. If you have app-level HTML customizations,
// move them here later.
export default function StudioDocument() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
