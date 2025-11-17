// Global TypeScript shims to relax JSX attribute expectations across the monorepo.
// These are intentionally permissive and temporary — used to quiet cross-version @types/react
// incompatibilities while we align the workspace to a single React/@types version.

declare module 'react' {
  interface StyleHTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }

  interface FormHTMLAttributes<T> {
    // Next.js App Router server actions can be functions; accept `any` for now.
    action?: any
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      form: any
      style: any
    }
  }
}

export {}
