"use client";
import { useEffect } from 'react';

export default function PwaServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(() => {
          // registration succeeded
        })
        .catch((err) => {
          // non-fatal
          console.warn('SW registration failed', err);
        });
    };

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
