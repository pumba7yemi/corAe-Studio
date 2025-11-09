"use client";

import React from "react";

type CheckResult = {
  item: {
    code: string;
  };
  actionable: boolean;
};

type Props = {
  code: string;               // e.g., "WORK.OPENING.CHECKLIST"
  results: CheckResult[];     // from server GET /api/have-you
  fallback?: React.ReactNode; // what to render if not actionable
  children: React.ReactNode;  // gated content
};

export default function HaveYouGate({ code, results, fallback = null, children }: Props) {
  const actionable = results.some((r) => r.item.code === code && r.actionable);
  return actionable ? <>{children}</> : <>{fallback}</>;
}