import React from 'react';

type Props = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
};

export function Card({ title, subtitle, children, className = '' }: Props) {
  return (
    <section className={`card ${className}`.trim()}>
      {title ? <h3>{title}</h3> : null}
      {subtitle ? <div className="subtitle">{subtitle}</div> : null}
      {children}
    </section>
  );
}

export default Card;
