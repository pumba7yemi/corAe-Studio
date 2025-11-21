// Minimal WorkflowSpec and Checkpoint types to satisfy compile during studio builds.
// Replace with the real workflow specs when available.
export type Checkpoint = {
  id: string;
  gate?: "human-approve" | string;
  // other fields may exist in full spec
};

export type WorkflowSpec = {
  id: string;
  checkpoints: Checkpoint[];
  // other metadata can be added here
};

export default {} as unknown;
