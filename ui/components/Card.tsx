import type { ReactNode } from "react";
export function Card(props: { children?: ReactNode; title?: string; subtitle?: string }) {
  return (
    <div>
      {props.title && <h3>{props.title}</h3>}
      {props.subtitle && <p>{props.subtitle}</p>}
      <div>{props.children}</div>
    </div>
  );
}