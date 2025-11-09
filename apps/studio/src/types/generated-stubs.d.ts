// Minimal stubs for generated modules to reduce TypeScript noise while generators
// are running or unavailable in the current environment. These declarations are
// intentionally conservative and export flexible any-like shapes so they can be
// replaced by the real generated modules later without breaking callers.

declare module "@/generated/*" {
  // Many generated modules export a PrismaClient named export. Provide a minimal
  // compatible shape so TypeScript can typecheck files that import these.
  export class PrismaClient {
    constructor(...args: any[]);
    [key: string]: any;
  }

  // Provide a default as well for code that does `import PrismaClient from "@/generated/.."`.
  const _default: typeof PrismaClient;
  export default _default;
}

// Generic fallback for any deeply-imported generated file pattern used by the app.
declare module "@/generated/*/index" {
  export * from "@/generated/*";
}
