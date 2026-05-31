import React from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [phase, setPhase] = React.useState<'enter' | 'exit'>('enter');

  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('exit'), 1800);
    const t2 = setTimeout(() => onFinish(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onFinish]);

  return (
    <div
      className="splash-screen"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1040 40%, #2d1b69 70%, #4f46e5 100%)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <div className="splash-icon" style={{
        fontSize: '4rem', marginBottom: '1rem',
        animation: 'splash-float 2s ease-in-out infinite',
      }}>
        🎓
      </div>
      <h1 style={{
        fontFamily: "'Outfit', sans-serif", fontSize: '2.5rem', fontWeight: 900,
        background: 'linear-gradient(135deg, #c3c0ff 0%, #ffb1c7 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        margin: 0, letterSpacing: '-0.02em',
      }}>
        Pwof Ou
      </h1>
      <p style={{
        color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600,
        marginTop: '0.5rem', letterSpacing: '0.3em', textTransform: 'uppercase',
      }}>
        Platfòm Edikasyon Ayisyen
      </p>
      <div className="splash-loader" style={{
        marginTop: '2rem', width: '120px', height: '3px', borderRadius: '3px',
        background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
      }}>
        <div className="splash-loader-bar" style={{
          height: '100%', width: '100%',
          background: 'linear-gradient(90deg, #4f46e5, #ffb1c7)',
          animation: 'splash-load 1.5s ease-in-out forwards',
          transformOrigin: 'left',
        }} />
      </div>
    </div>
  );
};

export default SplashScreen;
