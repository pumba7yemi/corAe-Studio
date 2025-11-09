// Minimal ambient declarations to reduce editor noise during quick triage.
// These are low-risk shims: they do not change runtime behavior, only
// provide types so the workspace compiles for development.

declare module '@corae/caia-core/memory-cube';
// avoid shadowing actual exports of workflows-core

declare module '@corae/cims-core/package.json' {
  const value: any;
  export default value;
}

declare module '@/workflows/runtime' {
  export function execute(...args: any[]): any;
  export function tick(...args: any[]): any;
  export const runFlow: any;
}

declare module '@/caia/memory' {
  export const appendDockyardMemory: any;
}

// Note: '@/lib/cims/send' is provided in the app code; avoid declaring
// a default export here to prevent duplicate-symbol issues.

// Path mapping now resolves @corae/caia-core to source; no broad ambient needed.

declare module './types';

declare global {
  type WeekRef = string;
  type ScheduleMode = string;
  type InvoiceDirection = string;
}

export {};
