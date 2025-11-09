// Re-export commonly used entry points for ascend-core
export { createAscendAttacher } from "./attach";
export * from "./roles";
export * from "./stages";

// (no default export) -- consumers should import named exports
