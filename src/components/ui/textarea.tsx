import * as React from "react";
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="border rounded-md px-3 py-2 w-full" {...props} />;
}
export default Textarea;