import React from 'react';

export function SessionUserSwitcher({ className }: { className?: string }) {
  return (
    <div className={["inline-flex items-center gap-2", className].filter(Boolean).join(' ')}>
      <div className="w-8 h-8 rounded-full bg-zinc-700" />
      <div className="text-sm">Demo User</div>
    </div>
  );
}

export default SessionUserSwitcher;
