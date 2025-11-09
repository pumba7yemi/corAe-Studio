export type AscendStageId = "Operative" | "Executive" | "Manager" | "Creator";
export type CreatorTrack = "SystemCreator" | "GrowthCreator" | "HybridCreator";

export interface AscendStage {
  id: AscendStageId;
  description: string;
  focus: string;
  transition: string;
}

export interface AscendPathConfig {
  track: CreatorTrack;                     // default track for this role
  learnings: string[];                     // surfaced in UI as “Learn this flow”
  ascendTrigger: string;                   // concise readiness statement
  nextStep: AscendStageId;                 // suggested destination after trigger
  culturalLine?: string;                   // optional per-role cultural line
}

export interface RoleAscendProfile {
  roleKey: string;                         // e.g. "WorkflowExecutive", "SalesExecutive"
  path: AscendPathConfig;
}