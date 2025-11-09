export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={"card " + (className ?? "")} style={{ padding: 12 }}>{children}</div>;
}
