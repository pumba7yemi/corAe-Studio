'use client';
import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace('/life/home/faith/catholicism');
    }
  }, []);

  return null;
}
