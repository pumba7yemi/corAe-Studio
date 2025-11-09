import * as React from "react";

export function Card({
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm ${className}`}
      {...rest}
    />
  );
}

export function CardHeader({
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 pb-2 ${className}`} {...rest} />;
}

export function CardTitle({
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold ${className}`} {...rest} />;
}

export function CardContent({
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 pt-0 ${className}`} {...rest} />;
}