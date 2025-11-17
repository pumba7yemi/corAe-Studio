"use client";

// Adapter for the canonical client component located at apps/studio/components/
// This file exists to satisfy imports that resolve via the app/* path during
// Next's build/runtime resolution. It simply re-exports the client component.
export { default } from "../../components/CaiaClientShell";
