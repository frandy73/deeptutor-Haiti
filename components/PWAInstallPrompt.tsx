import React, { useState, useEffect, useCallback, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = 'pwofou_pwa_install_dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if previously dismissed
  const wasDismissed = useCallback((): boolean => {
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (!dismissed) return false;
      const timestamp = parseInt(dismissed, 10);
      return Date.now() - timestamp < DISMISS_DURATION_MS;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (wasDismissed()) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 30 seconds of use
      timerRef.current = setTimeout(() => {
        setShowPrompt(true);
      }, 30_000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [wasDismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch {
      // Install prompt failed
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPrompt(false);
      setIsClosing(false);
      try {
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
      } catch {
        // Storage full — no big deal
      }
    }, 300);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '0 12px 12px',
        pointerEvents: 'none',
        animation: isClosing ? 'pwaSlideDown 0.3s ease-in forwards' : 'pwaSlideUp 0.4s ease-out',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: '480px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(15, 22, 41, 0.98), rgba(22, 29, 51, 0.98))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(99, 102, 241, 0.1)',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="Fèmen"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: '#7a8baa',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0,
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
            }}
          >
            📲
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 800,
              color: '#e8ecf4',
              lineHeight: 1.2,
            }}>
              Enstale Pwof Ou
            </h3>
            <p style={{
              margin: '2px 0 0',
              fontSize: '12px',
              fontWeight: 500,
              color: '#7a8baa',
            }}>
              Aksè rapid menm san entènèt
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}>
          {[
            { icon: '⚡', text: 'Pi vit' },
            { icon: '📴', text: 'Offline' },
            { icon: '🏠', text: 'Sou ekran' },
          ].map((b) => (
            <div
              key={b.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#a5b4fc',
              }}
            >
              <span>{b.icon}</span> {b.text}
            </div>
          ))}
        </div>

        {/* Install button */}
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          style={{
            width: '100%',
            padding: '13px 20px',
            borderRadius: '14px',
            border: 'none',
            background: isInstalling
              ? 'rgba(99, 102, 241, 0.3)'
              : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 800,
            cursor: isInstalling ? 'wait' : 'pointer',
            transition: 'all 0.3s',
            boxShadow: isInstalling ? 'none' : '0 4px 20px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isInstalling ? (
            <>⏳ Ap enstale...</>
          ) : (
            <>📥 Enstale Kounye a — Gratis!</>
          )}
        </button>
      </div>

      <style>{`
        @keyframes pwaSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pwaSlideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;
