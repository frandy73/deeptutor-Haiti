import React, { useState, useEffect, useRef } from 'react';

type ConnectionStatus = 'online' | 'offline' | 'slow';

interface NetworkInfo {
  status: ConnectionStatus;
  effectiveType?: string; // '4g', '3g', '2g', 'slow-2g'
  downlink?: number; // Mbps
}

const NetworkStatusManager: React.FC = () => {
  const [network, setNetwork] = useState<NetworkInfo>({ status: 'online' });
  const [showBanner, setShowBanner] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const previousStatus = useRef<ConnectionStatus>('online');

  useEffect(() => {
    const updateNetworkInfo = () => {
      const isOnline = navigator.onLine;

      if (!isOnline) {
        setNetwork({ status: 'offline' });
        setShowBanner(true);
        setIsExiting(false);
        previousStatus.current = 'offline';
        return;
      }

      // Check connection quality if available
      const conn = (navigator as any).connection;
      if (conn) {
        const effectiveType = conn.effectiveType;
        const downlink = conn.downlink;
        const isSlow = effectiveType === '2g' || effectiveType === 'slow-2g' || downlink < 0.5;

        if (isSlow) {
          setNetwork({ status: 'slow', effectiveType, downlink });
          setShowBanner(true);
          setIsExiting(false);
          previousStatus.current = 'slow';
          return;
        }
      }

      // Connection is good — hide banner with animation
      if (previousStatus.current !== 'online') {
        setNetwork({ status: 'online' });
        setIsExiting(true);
        setTimeout(() => {
          setShowBanner(false);
          setIsExiting(false);
        }, 2500); // Show "back online" message for 2.5s
        previousStatus.current = 'online';
      } else {
        setNetwork({ status: 'online' });
        setShowBanner(false);
      }
    };

    // Initial check
    updateNetworkInfo();

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);

    // Listen for connection quality changes
    const conn = (navigator as any).connection;
    if (conn) {
      conn.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      if (conn) {
        conn.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  if (!showBanner) return null;

  const isOffline = network.status === 'offline';
  const isSlow = network.status === 'slow';
  const isBackOnline = isExiting && network.status === 'online';

  const bgColor = isBackOnline
    ? 'linear-gradient(90deg, #059669, #10b981)'
    : isOffline
    ? 'linear-gradient(90deg, #dc2626, #ef4444)'
    : 'linear-gradient(90deg, #d97706, #f59e0b)';

  const message = isBackOnline
    ? '✅ Koneksyon retounen! Pwof Ou pare ankò.'
    : isOffline
    ? '📡 Pa gen entènèt — Ou ka toujou gade Flashcards, Nòt, ak Egzamen deja chaje yo.'
    : `🐌 Koneksyon lan fèb (${network.effectiveType || 'lant'}) — Repons AI yo ka pran plis tan.`;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: bgColor,
        color: 'white',
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 700,
        zIndex: 100,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        animation: isExiting
          ? 'netStatusExit 0.4s ease-in 2.1s forwards'
          : 'netStatusEnter 0.3s ease-out',
        overflow: 'hidden',
      }}
    >
      {/* Animated pulse dot */}
      {!isBackOnline && (
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'white',
            flexShrink: 0,
            animation: 'netPulse 1.5s ease-in-out infinite',
          }}
        />
      )}
      <span>{message}</span>

      <style>{`
        @keyframes netStatusEnter {
          from { max-height: 0; padding: 0 16px; opacity: 0; }
          to { max-height: 60px; padding: 8px 16px; opacity: 1; }
        }
        @keyframes netStatusExit {
          from { max-height: 60px; padding: 8px 16px; opacity: 1; }
          to { max-height: 0; padding: 0 16px; opacity: 0; }
        }
        @keyframes netPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
};

export default NetworkStatusManager;
