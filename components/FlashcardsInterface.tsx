import React, { useState, useCallback, useEffect } from 'react';
import { FlashCard, FlashCardDeck } from '../types';
import { loadFlashcardDecks, saveFlashcardDecks, updateStreakAndXP } from '../services/localStorageService';
import { XP_REWARDS } from '../constants';
import { FlashcardsSkeleton } from './SkeletonLoader';
import { notifySuccess, notifyInfo } from '../services/notificationService';

interface FlashcardsInterfaceProps {
  onGenerateFromAI: (topic: string) => Promise<string>;
  onMenuClick?: () => void;
}

const FlashcardsInterface: React.FC<FlashcardsInterfaceProps> = ({ onGenerateFromAI, onMenuClick }) => {
  const [decks, setDecks] = useState<FlashCardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashCardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState<'list' | 'study'>('list');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    setDecks(loadFlashcardDecks()); 
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const rawJson = await onGenerateFromAI(topic.trim());
      const parsed = JSON.parse(rawJson);
      const newDeck: FlashCardDeck = {
        id: Date.now().toString(),
        title: parsed.title || topic,
        createdDate: new Date().toISOString(),
        cards: (parsed.cards || []).map((c: { id?: string; front: string; back: string }) => ({
          id: c.id || Date.now() + '-' + Math.random(),
          front: c.front,
          back: c.back,
          known: false,
        })),
      };
      const updated = [newDeck, ...decks];
      setDecks(updated);
      saveFlashcardDecks(updated);
      setActiveDeck(newDeck);
      setCurrentCardIndex(0);
      setShowBack(false);
      setView('study');
      setTopic('');
      notifySuccess('🃏 Flashcards kreye!', `Pake "${newDeck.title}" a gen ${newDeck.cards.length} kat.`);
    } catch {
      alert('AI pa t ka jenere flashcards la. Eseye ankò.');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, decks, onGenerateFromAI]);

  const handleStudy = (deck: FlashCardDeck) => {
    setActiveDeck(deck);
    setCurrentCardIndex(0);
    setShowBack(false);
    setView('study');
  };

  const handleNext = useCallback(() => {
    if (!activeDeck) return;
    updateStreakAndXP(XP_REWARDS.FLASHCARD_REVIEWED);
    setShowBack(false);
    setTimeout(() => {
      setCurrentCardIndex(prev => prev < activeDeck.cards.length - 1 ? prev + 1 : prev);
    }, 150);
  }, [activeDeck]);

  const handlePrev = useCallback(() => {
    setShowBack(false);
    setTimeout(() => setCurrentCardIndex(prev => Math.max(0, prev - 1)), 150);
  }, []);

  const markKnown = useCallback((known: boolean) => {
    if (!activeDeck) return;
    const updatedCards = activeDeck.cards.map((c, i) => i === currentCardIndex ? { ...c, known } : c);
    const updatedDeck = { ...activeDeck, cards: updatedCards };
    setActiveDeck(updatedDeck);
    const updatedDecks = decks.map(d => d.id === updatedDeck.id ? updatedDeck : d);
    setDecks(updatedDecks);
    saveFlashcardDecks(updatedDecks);
    handleNext();
  }, [activeDeck, currentCardIndex, decks, handleNext]);

  const deleteDeck = (deckId: string) => {
    if (!window.confirm('Efase pake kart sa a?')) return;
    const updated = decks.filter(d => d.id !== deckId);
    setDecks(updated);
    saveFlashcardDecks(updated);
    if (activeDeck?.id === deckId) { setActiveDeck(null); setView('list'); }
  };

  if (view === 'study' && activeDeck && activeDeck.cards.length > 0) {
    const card = activeDeck.cards[currentCardIndex];
    const knownCount = activeDeck.cards.filter(c => c.known).length;
    const isDone = currentCardIndex === activeDeck.cards.length - 1 && showBack;
    const progress = ((currentCardIndex + 1) / activeDeck.cards.length) * 100;

    return (
      <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--surface-container-lowest)' }}>
        {/* Top bar */}
        <div className="shrink-0 p-3 sm:p-4 flex items-center justify-between border-b shadow-sm z-10 glass-card" style={{ borderRadius: 0, backdropFilter: 'blur(12px)' }}>
          <button onClick={() => setView('list')} 
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-main)' }}>
            ← <span className="hidden sm:inline uppercase tracking-widest">Retounen</span>
          </button>
          <div className="text-center flex-1 px-2 sm:px-4 min-w-0">
            <p className="text-sm font-black truncate" style={{ color: 'var(--text-main)' }}>{activeDeck.title}</p>
            <p className="text-[10px] font-bold mt-0.5 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Kart {currentCardIndex + 1} / {activeDeck.cards.length} <span className="mx-1 opacity-50">•</span> <span className="text-emerald-500">{knownCount} konnen</span>
            </p>
          </div>
          <div className="w-12 sm:w-24 shrink-0" />
        </div>

        {/* Progress bar */}
        <div className="h-1 shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full transition-all duration-500 rounded-r-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Study Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-2xl relative">
            
            {/* Card */}
            <div
              className={`relative rounded-[24px] sm:rounded-[32px] p-6 sm:p-12 shadow-2xl cursor-pointer transition-all duration-500 transform-gpu min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center text-center
                ${showBack ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-[1.02]' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:scale-[1.01]'}`}
              style={{ border: showBack ? 'none' : '2px solid rgba(255,255,255,0.1)' }}
              onClick={() => setShowBack(b => !b)}
            >
              {/* Corner decor */}
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6 text-xl sm:text-2xl opacity-20">{showBack ? '💡' : '❓'}</div>
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 text-xl sm:text-2xl opacity-20">{showBack ? '💡' : '❓'}</div>

              <p className={`text-[10px] font-black uppercase tracking-[3px] mb-4 sm:mb-6 ${showBack ? 'text-white/60' : 'text-slate-400'}`}>
                {showBack ? 'Repons' : 'Kesyon'}
              </p>
              
              <h2 className="text-lg sm:text-3xl font-black leading-tight max-w-xl">
                {showBack ? card.back : card.front}
              </h2>
              
              <div className={`absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center text-xs font-bold transition-opacity duration-300
                ${showBack ? 'opacity-0' : 'opacity-50 text-slate-400'}`}>
                Tap pou wè repons lan
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 max-w-md mx-auto">
              <button onClick={handlePrev} disabled={currentCardIndex === 0}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm transition-all border-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 glass-card"
                style={{ color: 'var(--text-main)' }}>
                ← Anvan
              </button>

              {showBack && (
                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={() => markKnown(false)}
                    className="flex-1 sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm text-white bg-red-500 shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95">
                    😕 Non
                  </button>
                  <button onClick={() => markKnown(true)}
                    className="flex-1 sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm text-white bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95">
                    ✅ Wi
                  </button>
                </div>
              )}

              <button onClick={handleNext} disabled={currentCardIndex === activeDeck.cards.length - 1}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm transition-all border-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 glass-card"
                style={{ color: 'var(--text-main)' }}>
                Swivan →
              </button>
            </div>

            {isDone && (
              <div className="absolute -bottom-20 left-0 right-0 text-center animate-fade-in">
                <p className="text-emerald-500 font-black text-lg bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 rounded-full inline-block border border-emerald-200 dark:border-emerald-900/40">
                  🎉 Bravo! Ou fini pake a!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--surface-container-lowest)' }}>
      {/* Header */}
      <div className="relative overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
          {onMenuClick && (
            <button onClick={onMenuClick} className="md:hidden p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-all text-white border border-white/10 shrink-0">
              ☰
            </button>
          )}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shrink-0">
            🃏
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Flashcards</h2>
            <p className="text-xs sm:text-sm font-medium text-white/80 mt-0.5 sm:mt-1">Memorize leson ou yo pi rapidman!</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 space-y-4 sm:space-y-6">
        
        {/* Generator */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl border-2 relative overflow-hidden" style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
          
          <h3 className="text-lg font-black mb-1.5" style={{ color: 'var(--text-main)' }}>Kreye nouvo flashcards ak AI ✨</h3>
          <p className="text-xs font-medium mb-4 sm:mb-5" style={{ color: 'var(--text-muted)' }}>Ekri yon sijè (ex: "Revolisyon Ayisyen", "Selil Animal") epi kite AI a travay.</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text" value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="Sijè w vle etidye a..." disabled={isGenerating}
              className="flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl text-sm font-bold outline-none border-2 transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50"
              style={{ background: 'var(--surface-container)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
            />
            <button onClick={handleGenerate} disabled={isGenerating || !topic.trim()}
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-sm text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[120px] sm:min-w-[140px]"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              {isGenerating ? <span className="animate-pulse">⏳ Ap jenere...</span> : 'Jenere Pake'}
            </button>
          </div>
        </div>

        {/* Deck list */}
        {decks.length === 0 ? (
          <div className="text-center py-8 sm:py-12" style={{ color: 'var(--text-muted)' }}>
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl mb-4">🃏</div>
            <p className="text-lg font-black mb-1" style={{ color: 'var(--text-main)' }}>Pa gen pake ankò</p>
            <p className="text-sm font-medium">Jenere premye pake flashcards ou anlè a.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Pake ou yo ({decks.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {decks.map(deck => {
                const knownCount = deck.cards.filter(c => c.known).length;
                const progress = deck.cards.length > 0 ? (knownCount / deck.cards.length) * 100 : 0;
                
  if (isLoading) {
    return <FlashcardsSkeleton />;
  }

  return (
                  <div key={deck.id} className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 group"
                    style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center text-lg sm:text-xl font-bold">
                        {deck.title.charAt(0).toUpperCase()}
                      </div>
                      <button onClick={() => deleteDeck(deck.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-900/20 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-110">
                        ✕
                      </button>
                    </div>
                    
                    <h4 className="text-base font-black truncate mb-1" style={{ color: 'var(--text-main)' }} title={deck.title}>
                      {deck.title}
                    </h4>
                    
                    <p className="text-xs font-bold mb-4" style={{ color: 'var(--text-muted)' }}>
                      {deck.cards.length} kart <span className="mx-1 opacity-50">•</span> {new Date(deck.createdDate).toLocaleDateString('fr-HT', { month: 'short', day: 'numeric' })}
                    </p>

                    {/* Mini progress */}
                    <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'var(--surface-container)' }}>
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>

                    <button onClick={() => handleStudy(deck)}
                      className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/40">
                      📖 Etidye Pake a
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsInterface;
