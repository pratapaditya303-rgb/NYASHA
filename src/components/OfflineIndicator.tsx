import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      setTimeout(() => setWasOffline(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-2xl border border-amber-400/40 backdrop-blur-md animate-bounce">
        <WifiOff className="w-4 h-4 text-amber-200" />
        <span>Offline Mode: Showing cached ID Card, Cause List & Local Data</span>
      </div>
    );
  }

  if (wasOffline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-700/95 text-white px-3.5 py-2 text-xs font-semibold shadow-2xl border border-emerald-400/40 backdrop-blur-md">
        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
        <span>Connected back online. Synced with Ballia Bar server.</span>
      </div>
    );
  }

  return null;
};
