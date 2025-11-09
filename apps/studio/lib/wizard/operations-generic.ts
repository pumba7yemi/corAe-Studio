// corAe Operations Wizard (Generic White-Label Version)
// One logic for any business type: the hands (Workplace) & feet (Back Office) workflow loop.

import type {
  WizardDef,
  StorageAdapter,
  TaskAdapter,
  EventBus,
} from "@/lib/wizard/wizard";
import {
  WizardEngine as Engine,
  InMemoryStorage,
  InMemoryTaskQueue,
  SimpleEventBus,
} from "@/lib/wizard/wizard";

export const OperationsGenericWizard: WizardDef = {
  id: "operations-generic",
  version: 1,
  firstStep: "REQUEST_INTAKE",
  steps: [
    {
      id: "REQUEST_INTAKE",
      title: "Request Intake",
      description:
        "A new operational request, order, or task is logged from the back-office or client side.",
      validate: (ctx) => {
        const ok = !!ctx.state.requestId || !!ctx.state.title;
        return {
          ok,
          errors: ok ? undefined : { title: "Request title or ID required" },
        };
      },
      onEnter: async (ctx) => {
        if (!ctx.state.requestId)
          ctx.state.requestId = "REQ-" + Date.now().toString(36).slice(-5);
        return ctx;
      },
    },
    {
      id: "CLASSIFY",
      title: "Classify Department",
      description:
        "Select which department or unit this belongs to (e.g., HR, Logistics, Sales, Maintenance).",
      validate: (ctx) => ({
        ok: !!ctx.state.department,
        errors: !ctx.state.department
          ? { department: "Select responsible department" }
          : undefined,
      }),
    },
    {
      id: "ASSIGN_WORKPARTNER",
      title: "Assign Workflow Partner",
      description:
        "Assign the responsible Workflow Partner™ or external collaborator to execute the task.",
      validate: (ctx) => {
        const ok =
          Array.isArray(ctx.state.assignees) &&
          ctx.state.assignees.length > 0;
        return {
          ok,
          errors: ok ? undefined : { assignee: "At least one assignee required" },
        };
      },
      onExit: async (ctx) => {
        // create queue record for execution follow-up
        ctx.state.queue = "operations-bin";
        return ctx;
      },
    },
    {
      id: "CONFIRM_ACCEPTANCE",
      title: "Acceptance Window",
      description:
        "Assigned Workflow Partner must confirm acceptance within a defined period.",
      validate: (ctx) => ({
        ok: !!ctx.state.accepted,
        errors: !ctx.state.accepted
          ? { accepted: "Awaiting acceptance" }
          : undefined,
      }),
      onEnter: async (ctx) => {
        ctx.state.acceptanceDeadline =
          ctx.state.acceptanceDeadline ??
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        return ctx;
      },
    },
    {
      id: "EXECUTION",
      title: "Execution Phase",
      description:
        "Work is carried out by the assigned Workflow Partner™ or automated process.",
      validate: (ctx) => ({
        ok: !!ctx.state.executionComplete,
        errors: !ctx.state.executionComplete
          ? { exec: "Mark execution complete" }
          : undefined,
      }),
    },
    {
      id: "QUALITY_REVIEW",
      title: "Quality Review",
      description:
        "Manager or QA reviewer verifies completion quality and compliance.",
      validate: (ctx) => ({
        ok: !!ctx.state.qaApproved,
        errors: !ctx.state.qaApproved
          ? { qa: "Mark QA approved" }
          : undefined,
      }),
    },
    {
      id: "CLOSE_LOOP",
      title: "Close & Feedback",
      description:
        "Feedback, reporting, and optional follow-up tasks are generated. The loop closes.",
      validate: (ctx) => ({ ok: true }),
    },
  ],
  onComplete: async (ctx) => {
    ctx.state.closed = true;
    ctx.state.closedAt = new Date().toISOString();
    return ctx;
  },
};

export function createOperationsGenericEngine(opts?: {
  storage?: StorageAdapter;
  tasks?: TaskAdapter;
  bus?: EventBus;
}) {
  return new Engine({
    def: OperationsGenericWizard,
    storage: opts?.storage ?? new InMemoryStorage(),
    tasks: opts?.tasks ?? new InMemoryTaskQueue(),
    bus: opts?.bus ?? new SimpleEventBus(),
  });
}