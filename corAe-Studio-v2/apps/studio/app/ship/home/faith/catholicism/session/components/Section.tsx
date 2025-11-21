'use client';
import React from 'react';

export default function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}
