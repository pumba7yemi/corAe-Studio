// Re-export lib BBB gate implementation so imports like "@/bbb/gate"
// resolve to the proper implementation during builds.
export * from "../../lib/bbb/gate";
export function checkLeak(): boolean { return false; }
