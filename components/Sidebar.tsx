import React, { useEffect, useState } from 'react';
import { ChatHistoryItem, DeepTutorConfig, Language, ModuleType, AIProvider, Subject } from '../types';
import { STUDENT_LEVEL_OPTIONS, SUBJECT_OPTIONS } from '../constants';
import { loadProgress } from '../services/localStorageService';
import { downloadBackup, downloadNotesAsText, downloadChatHistoryAsText } from '../services/backupService';

// ── Grouped Navigation ──────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Ak\u00e8y',
    items: [
      { icon: '🏠', label: ModuleType.DASHBOARD },
    ],
  },
  {
    label: 'Aprantisaj',
    items: [
      { icon: '🧠', label: ModuleType.GUIDED_LEARNING },
      { icon: '🏆', label: ModuleType.MASTER_LESSON },
      { icon: '🧪', label: ModuleType.SMART_SOLVER },
      { icon: '📝', label: ModuleType.QUESTION_GENERATOR },
      { icon: '✍️', label: ModuleType.CO_WRITER },
      { icon: '🔍', label: ModuleType.DEEP_RESEARCH },
    ],
  },
  {
    label: 'Resous',
    items: [
      { icon: '🃏', label: ModuleType.FLASHCARDS },
      { icon: '📚', label: ModuleType.KNOWLEDGE_BASE },
      { icon: '🔤', label: ModuleType.GLOSSARY },
      { icon: '🗒️', label: ModuleType.NOTEBOOK },
    ],
  },
  {
    label: 'Egzamen Leta',
    items: [
      { icon: '🎓', label: ModuleType.BAC_EXAMS },
      { icon: '📷', label: ModuleType.DEVOIR_PHOTO },
    ],
  },
  {
    label: 'Abònman',
    items: [
      { icon: '💎', label: ModuleType.PREMIUM },
    ],
  },
];

interface SidebarProps {
  selectedModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  config: DeepTutorConfig;
  onConfigChange: (newConfig: Partial<DeepTutorConfig>) => void;
  chatHistory: ChatHistoryItem[];
  onLoadChatHistory: (chatId: string) => void;
  onDeleteChatHistory: (chatId: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onClose?: () => void;
  isPremium?: boolean;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedModule, onSelectModule, config, onConfigChange,
  chatHistory, onLoadChatHistory, onDeleteChatHistory,
  isDark, onToggleTheme, onClose, isPremium = false, onLogout,
}) => {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PER_PAGE = 10;

  useEffect(() => {
    const p = loadProgress();
    setXp(p.xp);
    setStreak(p.streak);
  }, [selectedModule]);

  const isRestricted = (module: ModuleType) => false; // All modules are free

  const handleSelect = (module: ModuleType) => {
    onSelectModule(module);
    if (onClose) onClose();
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden glass-card"
      style={{ borderRight: '1px solid rgba(255,255,255,0.1)', borderRadius: 0 }}
    >
      {/* ── Brand Header ─────────────────────────────────────── */}
      <div
        className="relative shrink-0 px-5 pt-5 pb-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1040 0%, #2d1b69 60%, #44107a 100%)' }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none" />

        {/* logo row */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-xl shadow-lg shrink-0">
              🎓
            </div>
            <div>
              <h1 className="m-0 text-[17px] font-black text-white leading-none tracking-tight">Pwof Ou</h1>
              <p className="m-0 mt-0.5 text-[9px] font-black text-white/60 tracking-[3px] uppercase">Ayiti 🇭🇹</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Klè' : 'Nwa'}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/30 border border-white/10 text-white text-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden w-8 h-8 rounded-xl bg-white/15 hover:bg-white/30 border border-white/10 text-white text-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* XP + Streak pills */}
        <div className="relative z-10 flex gap-2">
          {[
            { icon: '⭐', val: xp, label: 'XP' },
            { icon: '🔥', val: streak, label: 'Jou Streak' },
          ].map(s => (
            <div
              key={s.label}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/10"
            >
              <span className="text-base">{s.icon}</span>
              <div>
                <p className="m-0 text-sm font-black text-white leading-none">{s.val}</p>
                <p className="m-0 text-[9px] font-bold text-white/50 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrollable Body ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-2.5 space-y-1">

        {/* Navigation Groups */}
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-1">
            <p
              className="ml-2 mb-1 text-[9px] font-black tracking-[2.5px] uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              {group.label}
            </p>
            <ul className="m-0 p-0 list-none flex flex-col gap-0.5">
              {group.items.map(({ icon, label }) => {
                const active = selectedModule === label;
                return (
                  <li key={label}>
                    <button
                      onClick={() => handleSelect(label)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all duration-300 group btn-lift
                        ${active
                          ? 'shadow-lg scale-[1.01]'
                          : 'hover:scale-[1.02]'
                        }`}
                      style={
                        active
                          ? {
                              background: 'linear-gradient(135deg, #4f46e5 0%, #ffb1c7 100%)',
                              color: '#fff',
                              boxShadow: '0 8px 32px 0 rgba(124,58,237,0.25)',
                            }
                          : {
                              background: 'transparent',
                              color: 'var(--text-main)',
                            }
                      }
                      onMouseEnter={e => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(79,70,229,0.07)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <span className="text-[16px] shrink-0 w-6 text-center">{icon}</span>
                      <span className="truncate flex-1">{label}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 mb-1 mx-2 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>
        ))}

        {/* Premium CTA */}
        {!isPremium && (
          <div className="px-0.5 mt-2 mb-3">
            <button
              onClick={() => handleSelect(ModuleType.PREMIUM)}
              className="w-full relative rounded-2xl overflow-hidden text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6001d1 100%)' }}
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 blur-2xl rounded-full" />
              <div className="relative z-10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💎</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-widest">Premium</span>
                </div>
                <p className="text-[10px] font-medium text-white/80 leading-relaxed">
                  Debloke tout fonksyonalite ak plan Premium!
                </p>
              </div>
            </button>
          </div>
        )}

        {/* ── Config Section ──────────────────────────────────── */}
        <div className="pt-1">
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">⚙️</span> Konfigirasyon
            </span>
            <span
              className="text-[9px] transition-transform duration-300"
              style={{ transform: isConfigOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▼
            </span>
          </button>

          {isConfigOpen && (
            <div
              className="mx-1 mt-1 mb-2 rounded-2xl p-3 space-y-3 glass-card"
            >
              {/* MENFP Toggle */}
              <div
                className="flex items-center justify-between p-3 rounded-xl border"
                style={{ borderColor: 'var(--accent-main)', background: 'var(--accent-light)' }}
              >
                <div>
                  <p className="m-0 text-xs font-black" style={{ color: 'var(--text-main)' }}>📚 Sipò MENFP</p>
                  <p className="m-0 mt-0.5 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Repons baze sou liv ofisyèl</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.officialContextEnabled}
                  onChange={e => onConfigChange({ officialContextEnabled: e.target.checked })}
                  className="w-5 h-5 cursor-pointer accent-indigo-600 rounded"
                />
              </div>

              {/* Selects */}
              {[
                {
                  label: 'Nivo Elèv',
                  val: config.studentLevel,
                  opts: STUDENT_LEVEL_OPTIONS.map(o => ({ v: o, l: o })),
                  onChange: (v: string) => onConfigChange({ studentLevel: v }),
                },
                {
                  label: 'Lang Repons',
                  val: config.responseLanguage,
                  opts: [{ v: Language.KREYOL, l: 'Kreyòl 🇭🇹' }, { v: Language.FRANCAIS, l: 'Français 🇫🇷' }],
                  onChange: (v: string) => onConfigChange({ responseLanguage: v as Language }),
                },
                {
                  label: 'Sijè Fokal',
                  val: config.selectedSubject || '',
                  opts: [{ v: '', l: 'Tout – Otomatik' }, ...SUBJECT_OPTIONS.map(s => ({ v: s.value, l: s.label }))],
                  onChange: (v: string) => onConfigChange({ selectedSubject: (v as Subject) || undefined }),
                },
              ].map(({ label, val, opts, onChange }) => (
                <div key={label}>
                  <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </label>
                  <select
                    value={val}
                    onChange={e => onChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold border outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                    style={{ background: 'var(--surface-container)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
                  >
                    {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              ))}

              {/* AI Provider */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  AI Provider
                </label>
                <div className="flex gap-2">
                  {[AIProvider.GEMINI, AIProvider.OLLAMA].map(p => {
                    const isActive = config.aiProvider === p;
                    return (
                      <button
                        key={p}
                        onClick={() => onConfigChange({ aiProvider: p })}
                        className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all duration-200 border"
                        style={
                          isActive
                            ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', borderColor: 'transparent', boxShadow: '0 2px 8px rgba(99,60,237,.3)' }
                            : { background: 'var(--surface-container)', color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)' }
                        }
                      >
                        {p === AIProvider.GEMINI ? '🌐 Gemini' : '🖥️ Ollama'}
                      </button>
                    );
                  })}
                </div>
                {config.aiProvider === AIProvider.OLLAMA && (
                  <input
                    value={config.ollamaModel}
                    onChange={e => onConfigChange({ ollamaModel: e.target.value })}
                    placeholder="Modèl Ollama (ex: llama3)"
                    className="w-full mt-2 px-3 py-2 rounded-xl text-xs font-bold border outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    style={{ background: 'var(--surface-container)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
                  />
                )}
              </div>

              {/* Backup */}
              <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <p className="m-0 mb-2 text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  📦 Backup Done
                </p>
                <button
                  onClick={() => downloadBackup()}
                  className="w-full py-2 rounded-xl text-[11px] font-black text-white mb-2 transition-all duration-300 hover:scale-[1.02] btn-lift"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 2px 8px rgba(99,60,237,.25)' }}
                >
                  Ekspòte Tout
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => downloadNotesAsText()}
                    className="py-2 rounded-xl text-[10px] font-bold border hover:scale-[1.02] transition-all duration-300 btn-lift"
                    style={{ background: 'var(--surface-container)', color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    Nòt .txt
                  </button>
                  <button
                    onClick={() => downloadChatHistoryAsText()}
                    className="py-2 rounded-xl text-[10px] font-bold border hover:scale-[1.02] transition-all duration-300 btn-lift"
                    style={{ background: 'var(--surface-container)', color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    Chat .txt
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Chat History ─────────────────────────────────────── */}
        <div>
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <span className="flex items-center gap-2"><span className="text-sm">🕐</span> Istwa Chat</span>
            <span
              className="text-[9px] transition-transform duration-300"
              style={{ transform: isHistoryOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▼
            </span>
          </button>

          {isHistoryOpen && (
            <div className="mx-1 mt-1 mb-2 space-y-1.5">
              <input
                type="text"
                value={historySearch}
                onChange={e => { setHistorySearch(e.target.value); setHistoryPage(1); }}
                placeholder="Rechèch nan istwa..."
                className="w-full px-3 py-2 rounded-xl text-[11px] font-bold border outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
              />
              <div className="max-h-56 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-0.5">
                {(() => {
                  const filtered = chatHistory.filter(item =>
                    item.title.toLowerCase().includes(historySearch.toLowerCase())
                  );
                  const totalPages = Math.max(1, Math.ceil(filtered.length / HISTORY_PER_PAGE));
                  const safePage = Math.min(historyPage, totalPages);
                  const pageItems = filtered.slice(0, safePage * HISTORY_PER_PAGE);
                  const showMore = pageItems.length < filtered.length;

                  if (filtered.length === 0) {
                    return (
                      <p className="text-[10px] font-bold text-center py-4 uppercase tracking-wider opacity-40" style={{ color: 'var(--text-muted)' }}>
                        Pa gen istwa ankò
                      </p>
                    );
                  }

                  return (
                    <>
                      {pageItems.map(item => (
                        <div
                          key={item.id}
                          className="group flex items-center justify-between p-2.5 rounded-xl transition-all hover:border-primary/30 glass-card"
                        >
                          <button
                            onClick={() => { onLoadChatHistory(item.id); if (onClose) onClose(); }}
                            className="flex-1 text-left min-w-0 pr-2"
                          >
                            <p className="m-0 text-xs font-bold truncate" style={{ color: 'var(--text-main)' }}>{item.title}</p>
                            <p className="m-0 mt-0.5 text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                              {new Date(item.timestamp).toLocaleDateString('fr-HT', { month: 'short', day: 'numeric' })}
                            </p>
                          </button>
                          <button
                            onClick={() => { if (window.confirm('Efase konvèsasyon sa a?')) onDeleteChatHistory(item.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {showMore && (
                        <button
                          onClick={() => setHistoryPage(prev => prev + 1)}
                          className="w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-indigo-500/10 btn-lift"
                          style={{ color: 'var(--accent-main)' }}
                        >
                          ↓ Wè plis ({filtered.length - pageItems.length} rete)
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="h-4" /> {/* bottom spacer */}

        {/* Keyboard shortcut hint */}
        <div className="px-3 py-2">
          <div className="rounded-xl p-3 text-center glass-card">
            <p className="m-0 text-[9px] font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
              <kbd className="px-1.5 py-0.5 rounded text-[9px] font-black font-mono" style={{ background: 'var(--surface-container)', color: 'var(--primary)' }}>?</kbd>
              {' '}ouvri èd klavye
            </p>
          </div>
        </div>

        {/* Logout */}
        {onLogout && (
          <div className="px-3 pb-3">
            <button
              onClick={() => { if (window.confirm('Ou vreman vle dekonekte?')) { onLogout(); if (onClose) onClose(); } }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 hover:bg-red-500/10"
              style={{ color: '#ef4444' }}
            >
              <span className="text-sm">🚪</span> Dekonekte
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;