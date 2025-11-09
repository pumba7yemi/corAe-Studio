import * as React from "react";

type Variant = "default" | "secondary" | "destructive";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium";
const variants: Record<Variant, string> = {
  default: "bg-black text-white",
  secondary: "bg-gray-100 text-gray-900 border border-gray-300",
  destructive: "bg-red-600 text-white",
};

export function Badge({ className = "", variant = "default", ...rest }: BadgeProps) {
  return <span className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}