// apps/studio/lib/ui/components/Button.tsx
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
};

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  const base =
    'px-3 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2';

  const tone =
    variant === 'primary'
      ? 'bg-[var(--accent)] text-white hover:opacity-90'
      : variant === 'secondary'
      ? 'bg-[var(--panel-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--panel)]'
      : 'bg-transparent hover:bg-[var(--panel)]';

  return <button className={`${base} ${tone} ${className}`} {...rest} />;
}

export default Button;
