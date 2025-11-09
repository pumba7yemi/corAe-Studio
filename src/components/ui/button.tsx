import * as React from "react";

type Variant = "default" | "secondary" | "outline";
type Size = "default" | "sm" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
const variants: Record<Variant, string> = {
  default: "bg-black text-white hover:bg-black/90",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  outline:
    "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
};
const sizes: Record<Size, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-6",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...rest }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  )
);
Button.displayName = "Button";

export default Button;