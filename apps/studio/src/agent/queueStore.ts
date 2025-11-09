// Re-export real implementations from lib when available so consumers who
// import from "@/agent/queueStore" get the proper API surface during builds.
export {
  loadQueue,
  saveQueue,
  clearQueue,
  shiftNext,
  type QueueItem,
  type QueueStatus,
} from "../../lib/agent/queueStore";
