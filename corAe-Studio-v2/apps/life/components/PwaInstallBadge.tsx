"use client";
import { useEffect, useState } from 'react';

export default function PwaInstallBadge() {
  const [deferred, setDeferred] = useState<any | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const onBefore = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBefore as any);
    window.addEventListener('appinstalled', onInstalled as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore as any);
      window.removeEventListener('appinstalled', onInstalled as any);
    };
  }, []);

  if (!visible) return null;

  const onInstall = async () => {
    if (deferred && typeof deferred.prompt === 'function') {
      try {
        await deferred.prompt();
        setDeferred(null);
        setVisible(false);
      } catch (e) {
        console.warn('Install prompt failed', e);
      }
    } else {
      alert('To install: iOS Safari: Share → Add to Home Screen. Android Chrome: Menu → Install.');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onInstall}
        className="px-4 py-2 rounded-full bg-sky-600 text-white shadow-lg"
        aria-label="Install corAe"
      >
        Install corAe
      </button>
    </div>
  );
}
