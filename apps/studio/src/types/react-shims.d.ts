// Local typing shims to relax JSX attribute expectations (non-invasive)
// These shims are intentionally minimal and scoped to the studio package.

// Ambient (non-module) declaration so augmentation applies even with multiple @types/react copies
declare module 'react' {
  interface StyleHTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }

  interface FormHTMLAttributes<T> {
    // Next.js App Router server actions use functions here; accept any for now.
    action?: any
  }
}

declare global {
  // allow `ts-node` and other tools to pick up this file without imports
  namespace JSX {
    interface IntrinsicAttributes {
      // ensure JSX global namespace exists and allow relaxed intrinsic attributes
    }
    interface IntrinsicElements {
      // keep existing types but allow `form` and `style` to accept our relaxed attrs
      form: any
      style: any
    }
  }
}

export {}
