import React, { useState, useEffect } from 'react';
import { GlossaryTerm } from '../types';
import { loadGlossaryTerms, saveGlossaryTerms } from '../services/localStorageService';

interface GlossaryInterfaceProps {
  onSearchTerm: (term: string) => Promise<GlossaryTerm | null>;
  onMenuClick?: () => void;
  isOffline?: boolean;
}

const GlossaryInterface: React.FC<GlossaryInterfaceProps> = ({ onSearchTerm, onMenuClick, isOffline }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [savedTerms, setSavedTerms] = useState<GlossaryTerm[]>([]);
  const [currentResult, setCurrentResult] = useState<GlossaryTerm | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { setSavedTerms(loadGlossaryTerms().reverse()); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setErrorMsg('');
    const termQuery = searchTerm.trim().toLowerCase();
    const existingTerm = savedTerms.find(t => t.termFR.toLowerCase() === termQuery || t.termHT.toLowerCase() === termQuery);
    
    if (existingTerm) { setCurrentResult(existingTerm); return; }
    if (isOffline) { setErrorMsg("Ou offline kounye a. Yo pako anrejistre mo sa a bò kote w la, tanpri retounen entènèt la pou chèche l."); return; }

    setIsSearching(true);
    setCurrentResult(null);

    try {
      const result = await onSearchTerm(searchTerm);
      if (result) {
        result.id = Date.now().toString();
        result.savedDate = new Date().toISOString();
        const updatedTerms = [result, ...savedTerms];
        setSavedTerms(updatedTerms);
        saveGlossaryTerms(updatedTerms);
        setCurrentResult(result);
      } else {
        setErrorMsg('Ekskiz, diksyonè syantifik lan pa gen referans pou tèm sa. Verifye òtograf la.');
      }
    } catch (err) {
      setErrorMsg('Pwoblèm rezo oswa koneksyon. Tanpri relonje entènèt ou an.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTermClick = (term: GlossaryTerm) => { setCurrentResult(term); setSearchTerm(term.termFR); };

  const handleDeleteTerm = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTerms.filter(t => t.id !== id);
    setSavedTerms(updated);
    saveGlossaryTerms(updated);
    if (currentResult?.id === id) setCurrentResult(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--surface-container-lowest)' }}>
      {/* Header */}
      <div className="relative overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 p-5 sm:p-6 flex items-center gap-4">
          {onMenuClick && (
            <button onClick={onMenuClick} className="md:hidden p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-all text-white border border-white/10 shrink-0">
              ☰
            </button>
          )}
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl shadow-lg shrink-0">
            🔤
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Glosè Syantifik</h2>
            <p className="text-sm font-medium text-white/80 mt-1">Diksyonè Fransè ↔ Kreyòl</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Search & Result */}
        <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-3xl mx-auto w-full space-y-8 z-10">
             
            <div className="text-center mt-4 mb-8">
              <h3 className="text-3xl sm:text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Tradiktè Syantifik
              </h3>
              <p className="text-sm sm:text-base font-medium max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
                Dekouvri klète konsèp Fransè akademik yo an <span className="font-bold text-indigo-500">Kreyòl</span>.
              </p>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="relative shadow-xl rounded-[2rem] overflow-hidden flex border-2 transition-all duration-300 hover:shadow-indigo-500/10 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500" 
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(22, 29, 51, 0.85)' }}>
              
              <div className="pl-6 flex items-center justify-center text-2xl opacity-50" style={{ color: 'var(--text-main)' }}>🔍</div>
              
              <input
                type="text" placeholder="Ex: Énergie, Polynôme..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={isSearching}
                className="w-full px-4 py-5 outline-none text-lg sm:text-xl font-bold bg-transparent"
                style={{ color: 'var(--text-main)' }}
              />
              <button type="submit" disabled={isSearching || !searchTerm.trim()}
                className={`px-8 sm:px-12 font-black text-sm sm:text-base text-white transition-all duration-300
                  ${isSearching || !searchTerm.trim() ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 active:scale-95'}`}
              >
                {isSearching ? <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Ap chèche</span> : 'Tradwi'}
              </button>
            </form>

            {/* Error MSG */}
            {errorMsg && (
              <div className="p-5 rounded-2xl text-red-600 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900/40 animate-shake flex items-center gap-3 shadow-sm font-bold text-sm">
                <span className="text-2xl">⚠️</span> {errorMsg}
              </div>
            )}

            {/* Result Card */}
            {currentResult && (
              <div className="rounded-[2rem] p-6 sm:p-10 shadow-2xl border-2 animate-fade-in relative overflow-hidden group mt-8" 
                   style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
                
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-150" />

                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b pb-6" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: 'var(--text-main)' }}>{currentResult.termFR}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🇭🇹</span>
                      <p className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 tracking-tight">{currentResult.termHT}</p>
                    </div>
                  </div>
                  {currentResult.category && (
                    <span className="mt-4 sm:mt-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                      {currentResult.category}
                    </span>
                  )}
                </div>

                <div className="relative z-10 space-y-8" style={{ color: 'var(--text-main)' }}>
                  {/* Definition */}
                  <div>
                    <strong className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">
                      <span>💡</span> Esplikasyon
                    </strong>
                    <p className="text-lg sm:text-xl font-medium leading-relaxed opacity-90">{currentResult.definitionHT}</p>
                  </div>

                  {/* Example */}
                  {currentResult.example && (
                    <div className="p-6 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                      <strong className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
                        <span>📝</span> Egzanp Konkrè
                      </strong>
                      <p className="text-base sm:text-lg italic font-medium leading-relaxed text-indigo-900 dark:text-indigo-200">
                        "{currentResult.example}"
                      </p>
                    </div>
                  )}

                  {/* Formula */}
                  {currentResult.formula && currentResult.formula.trim() !== "" && (
                    <div className="p-6 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-2xl font-serif text-blue-500 shrink-0">
                        ∑
                      </div>
                      <div>
                        <strong className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Fòmil Egzak la</strong>
                        <p className="font-mono text-xl sm:text-2xl font-bold tracking-tight">{currentResult.formula}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Saved History */}
        <div className="hidden lg:flex w-80 flex-col z-20" style={{ background: 'var(--surface)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <span>📥</span> Achiv Lokal (Offline)
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
            {savedTerms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                <span className="text-4xl mb-4">📭</span>
                <p className="text-xs font-medium px-4" style={{ color: 'var(--text-muted)' }}>Fè yon rechèch pou konsève li isit la pou kanw pèdi entènèt.</p>
              </div>
            ) : (
              savedTerms.map(term => (
                <div key={term.id} onClick={() => handleTermClick(term)}
                  className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                    ${currentResult?.id === term.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md scale-[1.02]' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <div className="pr-6">
                    <div className="font-bold text-sm mb-0.5 truncate" style={{ color: 'var(--text-main)' }}>{term.termFR}</div>
                    <div className="text-xs font-bold text-indigo-500 truncate">{term.termHT}</div>
                  </div>
                  <button onClick={(e) => handleDeleteTerm(term.id, e)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 w-8 h-8 flex items-center justify-center text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all">
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlossaryInterface;
