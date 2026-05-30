import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GlossaryTerm } from '../types';
import { loadGlossaryTerms, saveGlossaryTerms } from '../services/localStorageService';

interface DiksyonèPopòvProps {
  children: React.ReactNode;
  onLookupWord: (word: string) => Promise<GlossaryTerm | null>;
}

interface PopoverData {
  word: string;
  x: number;
  y: number;
}

const DiksyonèPopòv: React.FC<DiksyonèPopòvProps> = ({ children, onLookupWord }) => {
  const [popover, setPopover] = useState<PopoverData | null>(null);
  const [term, setTerm] = useState<GlossaryTerm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const currentWordRef = useRef('');

  const closePopover = useCallback(() => {
    setPopover(null);
    setTerm(null);
    setLoading(false);
    setError('');
    currentWordRef.current = '';
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closePopover();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closePopover]);

  const doLookup = useCallback(async (word: string) => {
    if (currentWordRef.current === word) return;
    currentWordRef.current = word;
    setLoading(true);
    setError('');
    setTerm(null);

    // first check local cache
    const cached = loadGlossaryTerms();
    const normalized = word.toLowerCase();
    const found = cached.find(
      t => t.termFR.toLowerCase() === normalized || t.termHT.toLowerCase() === normalized
    );
    if (found) {
      setTerm(found);
      setLoading(false);
      return;
    }

    try {
      const result = await onLookupWord(word);
      if (result) {
        result.id = Date.now().toString();
        result.savedDate = new Date().toISOString();
        const updated = [result, ...cached];
        saveGlossaryTerms(updated);
        setTerm(result);
      } else {
        setError('Pa gen definisyon pou mo sa.');
      }
    } catch {
      setError('Pa kapab chache definisyon an kounye a.');
    } finally {
      setLoading(false);
    }
  }, [onLookupWord]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();

    if (text && text.length >= 2 && text.length <= 60) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      setPopover({ word: text, x: rect.left + rect.width / 2, y: rect.bottom + 6 });
      doLookup(text);
      return;
    }

    // Fallback: detect word under click using caret position
    if (e.target instanceof Node && containerRef.current?.contains(e.target)) {
      const range = document.createRange();
      const sel = window.getSelection();
      if (!sel) return;

      try {
        const caretRange = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (!caretRange) return;

        const node = caretRange.startContainer;
        if (!node || node.nodeType !== Node.TEXT_NODE) return;
        const textContent = node.textContent || '';
        const offset = caretRange.startOffset;

        // find word boundaries
        let start = offset;
        let end = offset;
        while (start > 0 && /\S/.test(textContent[start - 1])) start--;
        while (end < textContent.length && /\S/.test(textContent[end])) end++;

        const word = textContent.slice(start, end).replace(/[^a-zA-ZÀ-ÿ0-9_\-]/g, '');
        if (word && word.length >= 2) {
          // clear selection before setting popover
          sel.removeAllRanges();
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          setPopover({
            word,
            x: e.clientX,
            y: rect.bottom + 6,
          });
          doLookup(word);
        }
      } catch {
        // caretRangeFromPoint not supported or failed
      }
    }
  }, [doLookup]);

  const popoverX = popover ? Math.max(12, Math.min(popover.x - 140, (window.innerWidth || 800) - 300)) : 0;
  const popoverY = popover ? popover.y : 0;

  return (
    <div ref={containerRef} onMouseUp={handleMouseUp} style={{ position: 'relative', cursor: 'default' }}>
      {children}

      {popover && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
              background: 'transparent',
            }}
            onClick={closePopover}
          />
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              left: `${popoverX}px`,
              top: `${popoverY}px`,
              zIndex: 999,
              width: '300px',
              maxHeight: '280px',
              overflowY: 'auto',
              background: 'rgba(22, 29, 51, 0.97)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Ap chache definisyon...
              </div>
            ) : error ? (
              <div style={{ fontSize: '12px', color: '#f87171', fontWeight: 600 }}>{error}</div>
            ) : term ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{term.termFR}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>{term.termHT}</span>
                </div>
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                  {term.definitionHT}
                </p>
                {term.example && (
                  <p style={{ fontSize: '11px', fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', marginTop: '8px', marginBottom: 0, padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
                    "{term.example}"
                  </p>
                )}
                {term.category && (
                  <span style={{ display: 'inline-block', marginTop: '8px', padding: '2px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(79,70,229,0.2)', color: 'var(--primary)' }}>
                    {term.category}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default DiksyonèPopòv;
