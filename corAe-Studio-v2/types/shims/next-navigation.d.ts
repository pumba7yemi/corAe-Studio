declare module 'next/navigation' {
  // Provide minimal shims used by this codebase to avoid type errors while
  // the workspace upgrades Next.js types. These are intentionally permissive.
  export function useRouter(): any;
  export function usePathname(): string | undefined;
  export function useParams(): Record<string, string> | undefined;
  export function useSelectedLayoutSegments(): string[] | undefined;
}
