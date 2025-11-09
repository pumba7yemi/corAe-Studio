import type { ButtonHTMLAttributes } from "react";
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const { variant, ...rest } = props;
  return <button {...rest} />;
}
