import type { RoleAscendProfile } from "./types";

export const RoleAscendProfiles: RoleAscendProfile[] = [
  {
    roleKey: "WorkflowExecutive",
    path: {
      track: "SystemCreator",
      learnings: [
        "Margins locked → cash",
        "Compliance renewals → risk avoided",
        "OBARI flows → recurring revenue"
      ],
      ascendTrigger: "Explains OBARI → cash; closes all renewals on time",
      nextStep: "Manager",
      culturalLine:
        "You are the proof corAe runs perfectly — and proof you can one day run it yourself."
    }
  },
  {
    roleKey: "SalesExecutive",
    path: {
      track: "GrowthCreator",
      learnings: [
        "One order → standing orders",
        "Credit/terms → cashflow engine",
        "Repeat sales → compounding margin"
      ],
      ascendTrigger: "Models sale → cashflow impact and hits repeat-order KPI",
      nextStep: "Manager",
      culturalLine:
        "Every sale is a vote for your future ownership. Learn the cash machine, then build one."
    }
  }
  // Add more roleKeys here per module…
];