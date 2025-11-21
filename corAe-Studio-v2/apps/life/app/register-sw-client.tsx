"use client";
import { useEffect } from 'react';

export default function RegisterSWClient() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
      const swUrl = '/sw.js';
      navigator.serviceWorker.register(swUrl).then((reg) => {
        // optional: listen for updates
        reg.onupdatefound = () => {
          const installing = reg.installing;
          installing?.addEventListener('statechange', () => {
            if (installing.state === 'installed') {
              // new content available
              console.log('corAe PWA: Service worker installed/updated');
            }
          });
        };
      }).catch((err) => console.warn('SW registration failed', err));
    }
  }, []);

  return null;
}
