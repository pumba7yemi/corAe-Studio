import type { AscendStage } from "./types";

export const AscendStages: AscendStage[] = [
  {
    id: "Operative",
    description: "Learns to trust corAe’s 100% execution.",
    focus: "System literacy basics",
    transition: "Promoted when accuracy reaches 100% for 14 days"
  },
  {
    id: "Executive",
    description: "Non-emotional checkpoint; captures exceptions.",
    focus: "System → cash awareness",
    transition: "Ascends once they can explain OBARI → cash, with 0 missed renewals"
  },
  {
    id: "Manager",
    description: "Aligns flows with margin, compliance, renewals.",
    focus: "Cashflow & scale strategy",
    transition: "Ascends after sustaining target GM & AR days for 2 cycles"
  },
  {
    id: "Creator",
    description: "Designs, innovates, and drives new prosperity.",
    focus: "Creation, ownership, and growth",
    transition: "Recognized when mechanics are fully internalized"
  }
];

export const NewAgeLine =
  "corAe frees you from mechanics so you can create. This is the new age of prosperity.";