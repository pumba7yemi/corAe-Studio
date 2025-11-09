// app/lib/automate/export.ts
import type { Workflow } from "./types";

export const toJSON = (wf: Workflow) => JSON.stringify(wf, null, 2);
export const fromJSON = (json: string): Workflow => JSON.parse(json);

// future: signatures, manifests, versioning
