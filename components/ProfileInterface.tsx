import React, { useEffect, useState, useRef } from 'react';
import { ModuleType, StudentProgress } from '../types';
import { UserProfile, updateUserProfile } from '../services/firebaseService';
import { loadProgress } from '../services/localStorageService';
import { BADGE_DEFINITIONS } from '../constants';

interface ProfileInterfaceProps {
  userProfile: UserProfile | null;
  currentUser: any;
  isDark: boolean;
  onToggleTheme: () => void;
  onSelectModule?: (module: ModuleType) => void;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

const ProfileInterface: React.FC<ProfileInterfaceProps> = ({
  userProfile, currentUser,
  isDark, onToggleTheme, onSelectModule, onLogout, onMenuClick,
}) => {
  const [progress, setProgress] = useState<StudentProgress>({ xp: 0, streak: 0, lastActiveDate: '', totalQuizzes: 0, totalMessages: 0, badges: [], subjectScores: {}, masteredTopics: [], masteryXp: 0 });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = userProfile?.displayName || currentUser?.displayName || 'Elèv';
  const email = userProfile?.email || currentUser?.email || '';
  const photoURL = userProfile?.photoURL || currentUser?.photoURL || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'E';
  const level = Math.floor(progress.xp / 100) + 1;
  const xpInLevel = progress.xp % 100;
  const joinedDate = userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : '—';

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
  }, []);

  useEffect(() => {
    if (editingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingName]);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || !userProfile) return;
    setIsSaving(true);
    await updateUserProfile(userProfile.uid, { displayName: trimmed });
    userProfile.displayName = trimmed;
    setIsSaving(false);
    setEditingName(false);
  };

  const handleLogout = () => {
    const confirmed = window.confirm('Èske w sèten ou vle dekonekte? Tout done w yo ap rete an sekirite.');
    if (confirmed && onLogout) onLogout();
  };

  const levelColors = ['#2563eb', '#0891b2', '#059669', '#d97706', '#0d9488', '#dc2626', '#0891b2', '#059669'];
  const levelColor = levelColors[(level - 1) % levelColors.length];
  const hoursStudied = Math.round(progress.totalMessages * 0.08 * 10) / 10;

  const earnedBadges = BADGE_DEFINITIONS.filter(b => progress.badges.includes(b.id));
  const lockedBadges = BADGE_DEFINITIONS.filter(b => !progress.badges.includes(b.id));

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-6 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {onMenuClick && (
              <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors">
                <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-main)' }}>Pwofil Mwen</h1>
          </div>
          <button onClick={onToggleTheme} className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Avatar + Name */}
        <div className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5" style={{ background: 'rgba(22,29,51,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-black shadow-xl shrink-0" style={{ background: `linear-gradient(135deg, ${levelColor}, ${levelColor}88)`, color: '#fff' }}>
            {photoURL ? <img src={photoURL} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            {editingName ? (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <input
                  ref={inputRef}
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                  className="text-xl sm:text-2xl font-black bg-transparent border-b-2 outline-none px-1 py-0.5"
                  style={{ color: 'var(--text-main)', borderColor: 'var(--primary)' }}
                />
                <button onClick={handleSaveName} disabled={isSaving} className="p-1.5 rounded-lg text-white text-xs font-bold" style={{ background: 'var(--primary)' }}>
                  {isSaving ? '...' : 'Anrejistre'}
                </button>
                <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  Annile
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl sm:text-2xl font-black m-0" style={{ color: 'var(--text-main)' }}>{displayName}</h2>
                <button onClick={() => { setNameInput(displayName); setEditingName(true); }} className="p-1 rounded-lg hover:bg-white/5 transition-colors text-sm" style={{ color: 'var(--text-muted)' }}>
                  ✏️
                </button>
              </div>
            )}
            {email && <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{email}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: levelColor + '22', color: levelColor, border: `1px solid ${levelColor}44` }}>
                Nivo {level}
              </span>
              {userProfile?.isPremium && (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #2563eb, #0d9488)' }}>
                  💎 Premium
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '⭐', value: `${progress.xp}`, label: 'XP Total', color: '#fbbf24' },
            { icon: '🔥', value: `${progress.streak}j`, label: 'Streak', color: '#f97316' },
            { icon: '💬', value: `${progress.totalMessages}`, label: 'Mesaj', color: '#60a5fa' },
            { icon: '📝', value: `${progress.totalQuizzes}`, label: 'Egzamen', color: '#a78bfa' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center justify-center rounded-2xl p-4 gap-1 transition-all duration-200 hover:scale-105" style={{ background: 'rgba(22,29,51,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Hours studied */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(22,29,51,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Tan etid total</span>
            <span className="text-lg font-black" style={{ color: 'var(--text-main)' }}>~{hoursStudied} èdtan</span>
          </div>
          <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            Manb depi {joinedDate}
          </div>
        </div>

        {/* Level bar */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(22,29,51,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Nivo {level}</span>
            <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{xpInLevel}/100 XP</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${xpInLevel}%`, background: `linear-gradient(90deg, ${levelColor}, ${levelColor}88)` }} />
          </div>
          <p className="mt-2 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {100 - xpInLevel} XP anvan ou rive nan nivo {level + 1}
          </p>
        </div>

        {/* Badges */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(22,29,51,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-sm font-black mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Badges ({earnedBadges.length}/{BADGE_DEFINITIONS.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {earnedBadges.map(badge => (
              <div key={badge.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-[10px] font-bold text-center leading-tight" style={{ color: 'var(--text-main)' }}>{badge.name}</span>
              </div>
            ))}
            {lockedBadges.map(badge => (
              <div key={badge.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl opacity-40" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-2xl">🔒</span>
                <span className="text-[10px] font-bold text-center leading-tight" style={{ color: 'var(--text-muted)' }}>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings / Actions */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(22,29,51,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-sm font-black mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Paramètres</h3>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Mode fè nwa</span>
            <button
              onClick={onToggleTheme}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isDark ? 'bg-blue-500' : 'bg-gray-500'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${isDark ? 'left-6.5' : 'left-0.5'}`} style={{ left: isDark ? '25px' : '2px' }} />
            </button>
          </div>

          {onLogout && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              Dekonekte
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileInterface;
