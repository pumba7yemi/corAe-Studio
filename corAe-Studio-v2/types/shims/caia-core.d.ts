declare module "@corae/caia-core" {
  // Minimal shims for the caia-core memory helpers used across the app.
  export function readShipMemory(scope: string, key?: string): Promise<any>;
  export function writeShipMemory(scope: string, data: any): Promise<void>;
  export function readDockyardMemory(scope: string, key?: string): Promise<any>;
  export function writeDockyardMemory(scope: string, key: string, value: any): Promise<void>;

  // Export other utilities as `any` to avoid noise during the incremental migration.
  const _default: any;
  export default _default;
}
