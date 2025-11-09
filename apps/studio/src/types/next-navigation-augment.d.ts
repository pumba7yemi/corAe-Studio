// Minimal shim for Next 15 type gaps (safe, dev-only)

declare module "next/navigation" {
  export * from "next/dist/client/components/navigation";

  export interface Router {
    push(href: string): void;
    replace(href: string): void;
    back(): void;
    refresh?(): void;
  }

  export function useRouter(): Router;
  export function usePathname(): string | null;
  export function useSearchParams(): URLSearchParams;
  export function redirect(url: string): never;
  export function notFound(): never;
}
