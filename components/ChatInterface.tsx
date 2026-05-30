import React, { useRef, useEffect, useCallback } from 'react';
import { ChatMessage, MessageSender, GlossaryTerm } from '../types';
import Message from './Message';
import LoadingSpinner from './LoadingSpinner';
import QuizCard from './QuizCard';
import ExamTimerWidget from './ExamTimerWidget';
import SkeletonLoader from './SkeletonLoader';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isGeneratingQuiz: boolean;
  selectedModuleName: string;
  onClearMessages: () => void;
  onGenerateQuiz: () => void;
  knowledgeFileName?: string;
  onMenuClick?: () => void;
  isOffline?: boolean;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onLookupWord?: (word: string) => Promise<GlossaryTerm | null>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages, onSendMessage, isLoading, isGeneratingQuiz,
  selectedModuleName, onClearMessages, onGenerateQuiz,
  knowledgeFileName, onMenuClick, isOffline,
  isDark, onToggleTheme, onLookupWord,
}) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on Ctrl+K custom event
  useEffect(() => {
    const handler = () => {
      textareaRef.current?.focus();
    };
    window.addEventListener('focus-chat-input', handler);
    return () => window.removeEventListener('focus-chat-input', handler);
  }, []);

  // Auto-resize textarea as user types
  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, []);

  useEffect(() => { autoResize(); }, [input, autoResize]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading && !isGeneratingQuiz && !isOffline) {
      onSendMessage(input.trim());
      setInput('');
      // Reset textarea height
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  // Send on Enter (Shift+Enter = new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPrompt = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const showWelcome = messages.length === 0 && !isLoading;
  const isDisabled = isLoading || isGeneratingQuiz || !!isOffline;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--surface-container-lowest)' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 z-10 relative glass-card"
        style={{
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 0,
          boxShadow: '0 8px 32px 0 rgba(124,58,237,0.1)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Hamburger — mobile only */}
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Ouvri menu"
              className="md:hidden w-9 h-9 shrink-0 flex items-center justify-center rounded-xl text-lg transition-all hover:bg-black/5 active:scale-95"
              style={{ color: 'var(--text-main)' }}
            >
              ☰
            </button>
          )}

          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 flex items-center justify-center text-lg shrink-0">
            🤖
          </div>

          <div className="min-w-0">
            <h2 className="m-0 text-sm font-black tracking-tight truncate" style={{ color: 'var(--text-main)' }}>
              {selectedModuleName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
              <p className="m-0 text-[10px] font-bold uppercase tracking-widest truncate" style={{ color: 'var(--text-muted)' }}>
                {knowledgeFileName ? `📚 ${knowledgeFileName}` : 'Poze yon kesyon'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Dark mode quick toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Mode Klè' : 'Mode Nwa'}
              className="w-9 h-9 rounded-xl text-sm flex items-center justify-center transition-all duration-300 border-2 hover:scale-110 active:scale-95 shrink-0"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                color: 'var(--text-muted)',
                background: 'rgba(22, 29, 51, 0.85)',
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={onClearMessages}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all border-2 hover:scale-[1.02] active:scale-[0.97]"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', background: 'rgba(22, 29, 51, 0.85)' }}
            >
              <span>✏️</span>
              <span className="hidden sm:inline uppercase tracking-widest">Nouvo</span>
            </button>
          )}
        </div>
      </div>

      {/* ── KB Context Banner ─────────────────────────────── */}
      {knowledgeFileName && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-bold border-b border-indigo-500/10 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400">
          <span className="shrink-0">📚</span>
          <span className="hidden sm:inline shrink-0">Kontèks aktif:</span>
          <strong className="truncate">{knowledgeFileName}</strong>
        </div>
      )}

      {/* ── Exam Timer ────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-3 empty:hidden">
        <ExamTimerWidget onTimeUp={() => {}} />
      </div>

      {/* ── Messages Area ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-3 sm:p-5 pb-2">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 animate-fade-in">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl sm:text-5xl mb-4 sm:mb-5 shadow-xl animate-float-medium animate-glow-pulse">
              👋
            </div>
            <h3 className="text-lg sm:text-2xl font-black mb-2" style={{ color: 'var(--text-main)' }}>
              Byenvini nan Pwof Ou!
            </h3>
            <p className="text-sm font-medium mb-4 sm:mb-5 leading-relaxed max-w-sm" style={{ color: 'var(--text-muted)' }}>
              Mwen se ekspè nan kourikoulòm edikasyon nasyonal Ayisyen an. Poze m nenpòt kesyon sou leson w yo.
            </p>

            {/* Quick prompts */}
            <div className="flex flex-col gap-2 w-full max-w-sm">
              <p className="m-0 text-[10px] font-black uppercase tracking-widest text-indigo-500 text-left">
                Kòmanse ak:
              </p>
              {[
                'Rezoud pwoblèm sa a pou mwen...',
                'Eksplike mwen kisa ki...',
                'Bay mwen yon rezime sou...',
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-left p-3 rounded-xl text-xs sm:text-sm font-medium shadow-sm border-2 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5 active:scale-[0.98] btn-lift btn-ripple"
                  style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full">
            {messages.map(msg =>
              msg.quizData ? (
                <div key={msg.id} className="animate-slide-up">
                  <QuizCard quizData={msg.quizData} onRegenerateQuiz={onGenerateQuiz} />
                </div>
              ) : (
                <div key={msg.id} className="animate-slide-up">
                  <Message message={msg} onLookupWord={onLookupWord} />
                </div>
              )
            )}

            {/* Loading indicator */}
            {(isLoading || isGeneratingQuiz) && (
              <div className="flex justify-start animate-fade-in">
                <div
                  className="px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-4 max-w-[85%] sm:max-w-md glass-card ambient-glow"
                  style={{
                    borderColor: 'var(--primary)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #db2777)',
                      boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                      animation: 'glow-pulse 1.5s ease-in-out infinite',
                    }}
                  >
                    🤖
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <div className="typing-dot-lg"></div>
                      <div className="typing-dot-lg"></div>
                      <div className="typing-dot-lg"></div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                      {isGeneratingQuiz ? 'Ap jenere egzèsis...' : 'Pwof Ou ap reflechi...'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}
      </div>

      {/* ── Offline Banner ────────────────────────────────── */}
      {isOffline && (
        <div className="shrink-0 px-4 py-2.5 text-center text-xs font-bold bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
          ⚠️ Ou pa konekte — AI pa disponib. Ou ka gade Flashcards ak Nòt ou yo.
        </div>
      )}

      {/* ── Input Bar — Agrandi ak pwofesyonèl ────────────── */}
      <div
        className="shrink-0 z-10 relative px-4 sm:px-6 pt-4 sm:pt-5 pb-2"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.95) 40%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto"
        >
          <div
            className="relative flex items-end gap-2 sm:gap-3 p-2 sm:p-3 rounded-3xl shadow-2xl transition-all duration-300 focus-within:shadow-indigo-500/20"
            style={{
              background: 'rgba(22, 29, 51, 0.95)',
              border: '2px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Textarea — agrandi, plis espas pou ekri */}
            <textarea
              ref={textareaRef}
              value={input}
              rows={3}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isOffline
                ? 'Pa gen koneksyon...'
                : 'Poze kesyon ou an isit la... Tape yon pwoblèm, mande yon eksplikasyon, oswa diskite yon sijè.'
              }
              disabled={isDisabled}
              className="flex-1 resize-none px-4 sm:px-5 py-3 sm:py-4 rounded-2xl text-base font-medium outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed leading-relaxed"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'var(--text-main)',
                minHeight: '80px',
                maxHeight: '200px',
                overflowY: 'auto',
                lineHeight: '1.6',
              }}
            />

            {/* Action buttons — pi gwo, plis vizib */}
            <div className="flex flex-col gap-2 shrink-0">
              {/* Quiz button */}
              <button
                type="button"
                onClick={() => { if (!isDisabled) { onGenerateQuiz(); setInput(''); } }}
                disabled={isDisabled}
                title="Jenere Egzèsis"
                aria-label="Jenere Egzèsis"
                className="w-12 h-12 rounded-2xl font-black text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center btn-ripple"
                style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)', boxShadow: '0 4px 16px rgba(236,72,153,0.35)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </button>

              {/* Send button — pi gwo ak gradyan plis klere */}
              <button
                type="submit"
                disabled={isDisabled || !input.trim()}
                title="Voye (Enter)"
                aria-label="Voye mesaj"
                className="w-12 h-12 rounded-2xl font-black text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center btn-ripple"
                style={{
                  background: input.trim() && !isDisabled
                    ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: input.trim() && !isDisabled
                    ? '0 4px 20px rgba(79,70,229,0.4)'
                    : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Hint text — pi klè, pi pwofesyonèl */}
          <div className="flex items-center justify-between mt-2 px-2">
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              <span style={{ opacity: 0.6 }}>Enter ↵ voye</span>
              <span style={{ opacity: 0.3, margin: '0 6px' }}>·</span>
              <span style={{ opacity: 0.6 }}>Shift+Enter ↩ liy nouvo</span>
            </p>
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>
              Ctrl+K chèche
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
