export interface FlowSignal {
  key: "food" | "mood" | "action" | "environment";
  value: number;
  note?: string;
  at?: string;
}

export interface FlowScoreSummary {
  score: number;
  lastUpdated: string;
  signals: FlowSignal[];
}
