// Hook creation deferred per guardrail revert — keep placeholder to avoid breaking imports

export function useViewport() {
  return {
    ts: new Date().toISOString(),
    innerWidth: 0,
    innerHeight: 0,
    docElClientHeight: 0,
    windowVH: 0,
    windowDVH: undefined,
  };
}