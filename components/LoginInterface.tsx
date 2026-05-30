import React, { useState, useEffect } from 'react';
import type { User } from '../services/firebaseService';
import { initFirebase, loginWithEmail, registerWithEmail, onAuthChange } from '../services/firebaseService';

interface LoginInterfaceProps {
  onLoginSuccess?: (user: User) => void;
  onMenuClick?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginInterface: React.FC<LoginInterfaceProps> = ({ onLoginSuccess, onMenuClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const setupAuth = async () => {
      await initFirebase();
      const result = await onAuthChange((user) => {
        if (user && onLoginSuccess) onLoginSuccess(user);
      });
      unsubscribe = result;
    };
    setupAuth();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Ranpli tout chan yo'); return; }
    if (showRegister && password !== confirmPassword) { setError('Modpas yo pa menm'); return; }
    if (showRegister && password.length < 6) { setError('Modpas dwe omwen 6 karaktè'); return; }
    setIsLoading(true);
    try {
      if (showRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      const codes: Record<string, string> = {
        'auth/invalid-email': 'Imel pa valid',
        'auth/user-not-found': 'Kont pa egziste',
        'auth/wrong-password': 'Modpas pa bon',
        'auth/email-already-in-use': 'Imel sa déjà itilize',
        'auth/invalid-credential': 'Imel oswa modpas pa bon',
      };
      setError(codes[err.code] || 'Erè: ' + (err.message || 'Eseye ankò'));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-2xl text-sm font-medium border-2 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--surface-container-lowest)' }}>
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #ec4899 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 text-center text-white px-12">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl">
            🎓
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight">Pwof Ou Ayiti</h1>
          <p className="text-white/80 text-lg font-medium mb-8 leading-relaxed">
            Platfòm #1 pou prepare<br/>Egzamen Leta MENFP
          </p>
          <div className="flex flex-col gap-3 text-left">
            {[
              ['🧠', 'AI Trap Detection pou evite pèlen'],
              ['📚', 'Tout Egzamen Leta 2015–2025'],
              ['⚡', 'Flashcards & Nòt illimité'],
              ['🏆', 'Sistèm XP ak Meday'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-semibold text-white/90">{text}</span>
              </div>
            ))}
          </div>
          <p className="text-white/50 text-xs font-bold mt-8 uppercase tracking-widest">© 2025 Pwof Ou 🇭🇹</p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto custom-scrollbar">

        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-xl shadow-indigo-500/25">
            🎓
          </div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-main)' }}>Pwof Ou Ayiti</h1>
        </div>

        <div className="w-full max-w-sm">
          {/* Tab switcher */}
          <div className="flex p-1 rounded-2xl mb-8" style={{ background: 'rgba(255,255,255,0.1)' }}>
            {[
              { label: 'Konekte', value: false },
              { label: 'Kreye Kont', value: true },
            ].map(tab => (
              <button
                key={String(tab.value)}
                onClick={() => { setShowRegister(tab.value); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all duration-200
                  ${showRegister === tab.value
                    ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {showRegister && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Non ou</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Jean Pierre" className={inputClass}
                  style={{ color: 'var(--text-main)' }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Imel</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="jean@email.com" className={inputClass}
                style={{ color: 'var(--text-main)' }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Modpas</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className={inputClass}
                style={{ color: 'var(--text-main)' }}
              />
            </div>

            {showRegister && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Konfime Modpas</label>
                <input
                  type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" className={inputClass}
                  style={{ color: 'var(--text-main)' }}
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm font-medium">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 25px -5px rgba(79,70,229,0.4)' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Pase...
                </span>
              ) : (
                showRegister ? 'Kreye Kont →' : 'Konekte →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>OSWA</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Guest button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3.5 rounded-2xl font-black text-sm border-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', background: 'rgba(22, 29, 51, 0.85)' }}
          >
            Kontinye kòm Envite 👻
          </button>

          <p className="text-center text-[10px] font-medium mt-6 opacity-50" style={{ color: 'var(--text-muted)' }}>
            🔒 Done ou yo an sekirite ak Firebase Auth
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginInterface;