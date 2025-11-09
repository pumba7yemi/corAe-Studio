declare module "next/link" {
  const Link: any;
  export default Link;
}

declare module "next/navigation" {
  export function usePathname(): string | null;
  export function useRouter(): { push: (p: any) => void };
}
