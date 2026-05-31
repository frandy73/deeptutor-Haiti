import React, { useEffect, useState } from 'react';
import { StudentProgress, ChatHistoryItem, ModuleType } from '../types';
import { loadProgress } from '../services/localStorageService';
import { BADGE_DEFINITIONS } from '../constants';
import { DashboardSkeleton } from './SkeletonLoader';

interface DashboardInterfaceProps {
  chatHistory: ChatHistoryItem[];
  onMenuClick?: () => void;
  onSelectModule?: (module: ModuleType) => void;
}

// ── Quick Action Card ────────────────────────────────────────────────────────
const QuickCard: React.FC<{
  icon: string;
  title: string;
  desc: string;
  gradient: string;
  onClick?: () => void;
}> = ({ icon, title, desc, gradient, onClick }) => (
    <button
      onClick={onClick}
      className="group relative text-left rounded-2xl p-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl btn-lift btn-ripple"
      style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
    {/* hover glow */}
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${gradient}`}
      style={{ opacity: 0 }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.07'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
    />
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-lg mb-3`}>
      {icon}
    </div>
    <p className="m-0 text-sm font-black leading-tight" style={{ color: 'var(--text-main)' }}>{title}</p>
    <p className="m-0 mt-1 text-[11px] font-medium leading-snug" style={{ color: 'var(--text-muted)' }}>{desc}</p>
  </button>
);

// ── Stat Pill ────────────────────────────────────────────────────────────────
const StatPill: React.FC<{ icon: string; value: number | string; label: string; color: string }> = ({ icon, value, label, color }) => (
  <div
    className="flex flex-col items-center justify-center rounded-2xl p-4 gap-1 transition-all duration-200 hover:scale-105 card-hover"
    style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}
  >
    <div className={`text-2xl mb-1`}>{icon}</div>
    <div className="text-2xl font-black" style={{ color }}>{value}</div>
    <div className="text-[9px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>{label}</div>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
const DashboardInterface: React.FC<DashboardInterfaceProps> = ({ chatHistory, onMenuClick, onSelectModule }) => {
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => { setProgress(loadProgress()); }, []);

  if (!progress) return <DashboardSkeleton />;

  const earnedBadges = BADGE_DEFINITIONS.filter(b => progress.badges.includes(b.id));
  const nextBadge = BADGE_DEFINITIONS.find(b => !progress.badges.includes(b.id));
  const xpInLevel = progress.xp % 100;
  const level = Math.floor(progress.xp / 100) + 1;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjou' : 'Bonswa';

  const quickActions = [
    { icon: '🧠', title: 'Kòmanse Aprann', desc: 'Gid Aprantisaj pèsonalize', gradient: 'from-indigo-500 to-purple-600', module: ModuleType.GUIDED_LEARNING },
    { icon: '🧪', title: 'Rezoud Pwoblèm', desc: 'Entwodwi devwa ou pou solisyon', gradient: 'from-emerald-500 to-teal-600', module: ModuleType.SMART_SOLVER },
    { icon: '🎓', title: 'Egzamen Leta', desc: 'Pratike egzamen ofisyèl MENFP', gradient: 'from-orange-500 to-red-600', module: ModuleType.BAC_EXAMS },
    { icon: '🃏', title: 'Flashcards', desc: 'Retann ak kat memwa rapide', gradient: 'from-pink-500 to-rose-600', module: ModuleType.FLASHCARDS },
    { icon: '📚', title: 'Baz Konesans', desc: 'Chaje dokiman ak liv ou yo', gradient: 'from-blue-500 to-cyan-600', module: ModuleType.KNOWLEDGE_BASE },
    { icon: '🗒️', title: 'Kaye Nòt', desc: 'Ekri epi organize nòt ou yo', gradient: 'from-violet-500 to-fuchsia-600', module: ModuleType.NOTEBOOK },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar" style={{ background: 'var(--surface-container-lowest)' }}>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 60%, #a21caf 100%)' }}
      >
        {/* bg decorations */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        {/* extra glow for dark mode */}
        <div className="absolute inset-0 pointer-events-none dark:block hidden" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(99,102,241,0.2) 0%, transparent 60%)' }} />

        <div className="relative z-10 p-5 sm:p-6 max-w-5xl mx-auto w-full">
          {/* top row */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className="md:hidden w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 border border-white/10 text-white flex items-center justify-center transition-all shrink-0"
                >
                  ☰
                </button>
              )}
              <div>
                <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-1 animate-fade-in">{greeting}, Elèv! 👋</p>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-none animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  Tablodbo w 🏠
                </h2>
              </div>
            </div>

            {/* Level badge */}
            <div className="text-center shrink-0">
              <div
                className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex flex-col items-center justify-center shadow-lg"
              >
                <span className="text-lg font-black text-white leading-none">{level}</span>
                <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">Nivo</span>
              </div>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white/70 text-[11px] font-bold">XP pou nivo {level + 1}</span>
              <span className="text-white font-black text-[11px]">{xpInLevel}/100</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${xpInLevel}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))' }}
              />
            </div>
          </div>

          {/* Stat pills row */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { icon: '⭐', val: progress.xp, label: 'Total XP' },
              { icon: '🔥', val: `${progress.streak}j`, label: 'Streak' },
              { icon: '🏆', val: earnedBadges.length, label: 'Badge' },
              { icon: '📝', val: progress.totalMessages, label: 'Mesaj' },
            ].map((s, si) => (
              <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/10 backdrop-blur-sm animate-fade-in" style={{ animationDelay: `${0.2 + si * 0.08}s` }}>
                <span className="text-sm">{s.icon}</span>
                <span className="text-white text-xs font-black">{s.val}</span>
                <span className="text-white/50 text-[9px] font-bold uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 lg:p-6 space-y-6 max-w-5xl mx-auto w-full">

        {/* ── Quick Stats Grid ──────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <StatPill icon="⭐" value={progress.xp} label="Total XP" color="#6366f1" />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <StatPill icon="🔥" value={`${progress.streak}j`} label="Streak" color="#f97316" />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <StatPill icon="📝" value={progress.totalMessages} label="Mesaj" color="#10b981" />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <StatPill icon="🏆" value={progress.totalQuizzes} label="Quiz" color="#a855f7" />
          </div>
        </div>

        {/* ── Next Badge CTA ──────────────────────────────── */}
        {nextBadge && (
          <div
            className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-md animate-slide-up"
            style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'var(--primary)', borderStyle: 'dashed', animationDelay: '0.15s' }}
          >
            <div className="text-3xl shrink-0 opacity-40 grayscale">{nextBadge.icon}</div>
            <div className="min-w-0">
              <p className="m-0 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                🎯 Pwochen Meday
              </p>
              <p className="m-0 mt-0.5 text-sm font-black" style={{ color: 'var(--text-main)' }}>{nextBadge.name}</p>
              <p className="m-0 mt-0.5 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{nextBadge.description}</p>
            </div>
          </div>
        )}

        {/* ── Quick Actions ────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-3 animate-fade-in" style={{ color: 'var(--text-muted)' }}>
            ⚡ Aksyon Rapid
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map((qa, idx) => (
              <div key={qa.title} className="animate-slide-up" style={{ animationDelay: `${idx * 0.06}s` }}>
              <QuickCard
                icon={qa.icon}
                title={qa.title}
                desc={qa.desc}
                gradient={qa.gradient}
                onClick={() => onSelectModule && onSelectModule(qa.module)}
              />
              </div>
            ))}
          </div>
        </div>

        {/* ── Badges ────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 shadow-sm animate-slide-up"
          style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)', animationDelay: '0.2s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="m-0 font-black text-base" style={{ color: 'var(--text-main)' }}>🏅 Meday ou yo</h3>
            <span
              className="text-xs font-black px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(79,70,229,0.15)', color: 'var(--primary)' }}
            >
              {earnedBadges.length}/{BADGE_DEFINITIONS.length}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {BADGE_DEFINITIONS.map(badge => {
              const earned = progress.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  title={`${badge.name}: ${badge.description}`}
                  className={`flex flex-col items-center p-2.5 rounded-xl text-center transition-all duration-300 cursor-default
                    ${earned ? 'hover:scale-110 hover:shadow-lg animate-pop-in' : 'opacity-25 grayscale'}`}
                  style={{
                    background: earned ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.1)',
                    border: earned ? '1px solid var(--primary)' : '1px solid transparent',
                  }}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-[9px] mt-1 font-bold leading-tight" style={{ color: 'var(--text-main)' }}>
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Activity ───────────────────────────────── */}
        {chatHistory.length > 0 && (
          <div
            className="rounded-2xl p-5 shadow-sm animate-slide-up"
            style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)', animationDelay: '0.25s' }}
          >
            <h3 className="m-0 font-black text-base mb-4" style={{ color: 'var(--text-main)' }}>🕐 Dènye Aktivite</h3>
            <div className="space-y-2">
              {chatHistory.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.01] animate-fade-in"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'var(--surface-container-lowest)', animationDelay: `${0.3 + idx * 0.05}s` }}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-sm shrink-0 font-black" style={{ color: 'var(--primary)' }}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate m-0" style={{ color: 'var(--text-main)' }}>{item.title}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {item.moduleType}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {new Date(item.timestamp).toLocaleDateString('fr-HT', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty State ───────────────────────────────────── */}
        {chatHistory.length === 0 && (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'rgba(22, 29, 51, 0.85)', border: '2px dashed rgba(255,255,255,0.1)' }}
          >
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="font-black text-lg mb-2" style={{ color: 'var(--text-main)' }}>Kòmanse aprann jodi a!</h3>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Chwazi yon modil nan menu a pou kòmanse premye sesyon ou an.
            </p>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
};

export default DashboardInterface;
