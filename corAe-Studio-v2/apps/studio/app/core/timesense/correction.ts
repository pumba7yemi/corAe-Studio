import type { TaskTiming } from "./matrix";

export function runCorrectionDialogue(taskTiming: TaskTiming) {
  return [
    {
      type: "question",
      text: `Have you been following the task flow exactly as written? (${taskTiming.key})`,
    },
    {
      type: "question",
      text: "Have there been new conditions (traffic, workload, delays)?",
    },
    {
      type: "decision",
      text: `Your estimate was ${taskTiming.estimatedMinutes} min but real average is ${Math.round(
        taskTiming.realMinutesAvg
      )} min.`,
      action: "adjustEstimate",
    },
  ];
}
