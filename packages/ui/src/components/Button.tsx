export function Button({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" className={"btn " + (className ?? "")} onClick={onClick}>
      {children}
    </button>
  );
}
