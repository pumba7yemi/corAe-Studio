export {};

declare global {
  interface String {
    replaceAll(search: string | RegExp, replacement: string): string;
  }
}
