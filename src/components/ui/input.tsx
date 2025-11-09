import * as React from "react";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="border rounded-md px-3 py-2 w-full" {...props} />;
}
export default Input;