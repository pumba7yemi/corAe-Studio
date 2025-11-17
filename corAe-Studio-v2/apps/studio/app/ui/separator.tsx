import React from 'react';

export function Separator({ className }: { className?: string }) {
  return <div className={["h-px bg-muted/20 my-2", className].filter(Boolean).join(' ')} />;
}

export default Separator;
