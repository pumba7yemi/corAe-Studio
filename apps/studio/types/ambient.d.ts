declare module 'next/headers' {
  export const headers: any;
  export const cookies: any;
  const _default: any;
  export default _default;
}

declare module 'next/*';


declare module 'next/font/google' {
  const Inter: any;
  export { Inter };
  export default Inter;
}

declare module 'next/dynamic' {
  const dynamic: any;
  export default dynamic;
}

declare module 'next/image' {
  const Image: any;
  export default Image;
}

declare module 'next/cache' {
  export function revalidatePath(path?: string): void;
}

declare module 'next/document' {
  const Document: any;
  export default Document;
}

declare module 'next/navigation' {
  export function useParams<T = any>(): any;
  export function useRouter(): any;
  export function useSearchParams(): any;
}

declare module '@/src/caia/*';
declare module '@/src/caia/modules';

// Allow React <form action={serverAction}> usage used by Next.js app router
import * as React from 'react';
declare module 'react' {
  interface FormHTMLAttributes<T> extends React.HTMLAttributes<T> {
    // Next server actions use functions as the `action` prop; accept any here.
    action?: any;
  }
}
