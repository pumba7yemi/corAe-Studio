// Minimal stub for workflow specs used by have-you related code.
// Keep this local to apps/studio to avoid touching shared packages.

export type WorkflowSpec = {
  id: string;
  title: string;
  description?: string;
  createdAt?: Date | string;
  [key: string]: any;
};

export type Checkpoint = {
  id: string;
  specId?: string;
  status?: string;
  createdAt?: Date | string;
  [key: string]: any;
};

export const defaultSpecs: WorkflowSpec[] = [
  { id: "init", title: "Initialization" },
  { id: "review", title: "Review Process" },
];
