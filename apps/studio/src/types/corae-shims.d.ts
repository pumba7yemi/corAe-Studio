// Minimal ambient declaration: treat any `@corae/*` package as an `any` module.
// This avoids many missing-declaration and named-export type errors during
// incremental migration of workspace packages. It's intentionally permissive
// and should be replaced by proper typings for each package when available.
declare module "@corae/*";
