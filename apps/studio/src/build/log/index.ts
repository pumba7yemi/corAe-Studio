// During builds prefer to re-export the real implementations from lib so
// callers that use readEvents/logEvent/appendEvent are satisfied.
export { logEvent, readEvents, listEvents } from "../../../lib/build/log";
// Compatibility alias used across older code
export { logEvent as appendEvent } from "../../../lib/build/log";

// Provide simple compatibility helpers as well
export function info(...args: any[]) {
  // eslint-disable-next-line no-console
  console.info(...args);
}

export function error(...args: any[]) {
  // eslint-disable-next-line no-console
  console.error(...args);
}

export default { info, error };
