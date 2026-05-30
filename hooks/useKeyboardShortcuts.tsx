import { useEffect, useCallback, useState, useRef } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const [showHelp, setShowHelp] = useState(false);
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in an input
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    for (const s of shortcutsRef.current) {
      const matchCtrl = s.ctrl ? e.ctrlKey || e.metaKey : true;
      const matchShift = s.shift ? e.shiftKey : !e.shiftKey;
      const matchAlt = s.alt ? e.altKey : !e.altKey;
      const matchKey = e.key.toLowerCase() === s.key.toLowerCase();

      if (matchCtrl && matchShift && matchAlt && matchKey) {
        e.preventDefault();
        s.action();
        return;
      }
    }

    // Show help on ?
    if (!isInput && e.key === '?') {
      setShowHelp(prev => !prev);
    }

    // Escape closes help
    if (e.key === 'Escape' && showHelp) {
      setShowHelp(false);
    }
  }, [showHelp]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp };
}

export const DEFAULT_SHORTCUTS_DEFINITIONS = [
  { key: 'k', ctrl: true, description: 'Chèche / Poze kesyon' },
  { key: 'n', ctrl: true, description: 'Nouvo konvèsasyon' },
  { key: 't', ctrl: true, description: 'Chanje mode (nwa/klè)' },
  { key: 'd', ctrl: true, description: 'Ale nan Tablodbo' },
  { key: 'b', ctrl: true, description: 'Ale nan Egzamen Leta' },
  { key: 'f', ctrl: true, description: 'Ale nan Flashcards' },
  { key: ',', ctrl: true, description: 'Ouvri konfigirasyon' },
  { key: 'Escape', ctrl: false, description: 'Fèmen sidebar / help' },
  { key: '?', ctrl: false, description: 'Montre/kache èd klavye' },
];

export const ShortcutsHelpModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  extraShortcuts?: { key: string; description: string; ctrl?: boolean }[];
}> = ({ isOpen, onClose, extraShortcuts = [] }) => {
  if (!isOpen) return null;

  const allShortcuts: { key: string; ctrl?: boolean; description: string }[] = [
    ...DEFAULT_SHORTCUTS_DEFINITIONS,
    ...extraShortcuts,
  ];

  const formatKey = (s: { key: string; ctrl?: boolean; description: string }) => {
    const parts: string[] = [];
    if (s.ctrl) parts.push('Ctrl');
    const key = s.key === 'Escape' ? 'Esc' : s.key === ',' ? ',' : s.key.toUpperCase();
    parts.push(key);
    return parts.join(' + ');
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-3xl p-6 w-full max-w-md shadow-2xl glass-card"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black" style={{ color: 'var(--text-main)' }}>
            ⌨️ Rakut Klavye
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(22, 29, 51, 0.85)', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {allShortcuts.map(s => (
            <div
              key={s.key + (s.ctrl ? '-ctrl' : '')}
              className="flex items-center justify-between p-2.5 rounded-xl"
              style={{ background: 'var(--surface-container)' }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                {s.description}
              </span>
              <kbd
                className="px-2 py-1 rounded-lg text-[11px] font-black font-mono glass-card"
                style={{
                  color: 'var(--primary)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                {formatKey(s)}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-[10px] font-medium text-center mt-5 opacity-50" style={{ color: 'var(--text-muted)' }}>
          Tape ? nenpòt kote pou ouvri/fèmen èd sa a
        </p>
      </div>
    </div>
  );
};
