"use client";

import React from "react";

export function Card({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={className ?? "rounded-xl border border-slate-700 p-4"}>{children}</div>;
}

export function CardHeader({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={className ?? "mb-2 font-semibold text-lg"}>{children}</div>;
}

export function CardTitle({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={className ?? "text-sm font-medium"}>{children}</div>;
}

export function CardContent({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={className ?? "mt-2"}>{children}</div>;
}
