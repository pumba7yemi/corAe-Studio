import React from 'react';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={[ 'w-full border rounded px-2 py-1 font-sans text-sm bg-transparent', className ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

export default Input;
