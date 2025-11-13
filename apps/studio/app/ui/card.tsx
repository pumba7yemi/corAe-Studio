import React from 'react';

export function Card({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={["rounded-xl border bg-card overflow-hidden", className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={["p-4", className].filter(Boolean).join(' ')}>{children}</div>;
}

export default Card;
