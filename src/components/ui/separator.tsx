import * as React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({
  orientation = "horizontal",
  className = "",
  ...rest
}: Props) {
  const common = "bg-gray-200";
  const cls =
    orientation === "vertical"
      ? `w-px h-5 ${common}`
      : `h-px w-full ${common}`;
  return <div className={`${cls} ${className}`} role="separator" {...rest} />;
}