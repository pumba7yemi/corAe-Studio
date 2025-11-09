// Minimal ambient augmentation to provide the `Prisma` type when the generated
// @prisma/client types don't expose it in some development snapshots.
// This is a reversible, low-risk shim to reduce noise while the real client is
// regenerated/verified. Prefer removing when the generated client exports are
// consistent.
declare module "@prisma/client" {
  // Keep this permissive — callers often only need to reference `Prisma` as a
  // namespace/type container. Narrow later by regenerating the client.
  export type Prisma = any;

  // Provide a minimal value-namespace for runtime usages like `new Prisma.Decimal(...)`.
  // These are intentionally permissive; they exist to reduce type noise during development.
  export namespace Prisma {
    export class Decimal {
      constructor(value: any);
      add(n: any): any;
      lt(n: any): boolean;
      lte(n: any): boolean;
      gt(n: any): boolean;
      gte(n: any): boolean;
      eq(n: any): boolean;
      mul(n: any): any;
      minus(n: any): any;
      sub(n: any): any;
      toNumber(): number;
      toString(): string;
    }

    export type TransactionClient = any;
    export type InputJsonValue = any;
  }
}
