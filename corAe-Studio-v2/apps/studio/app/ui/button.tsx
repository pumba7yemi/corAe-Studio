import React from 'react';

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' | 'default' }) {
  const { variant, className, children, ...rest } = props;
  const base = 'inline-flex items-center px-3 py-1 rounded';
  const variantClass = variant === 'outline' ? 'border' : 'bg-slate-900 text-white';
  return (
    <button {...rest} className={[base, variantClass, className].filter(Boolean).join(' ')}>
      {children}
    </button>
  );
}

export default Button;
