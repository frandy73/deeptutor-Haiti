import React, { useState } from 'react';
import ExamLibraryPanel from './ExamLibraryPanel';
import { Language, AIProvider } from '../types';

interface BacExamsInterfaceProps {
  onStartExam: (level: string, subject: string, year: string, topic?: string) => void;
  onGenerateQuiz?: (level: string, subject: string, year: string) => void;
  onMenuClick?: () => void;
  isOffline?: boolean;
  studentLevel?: string;
  responseLanguage?: Language;
  aiProvider?: AIProvider;
  ollamaModel?: string;
}

const levels = ['9ème AF', 'NS4'];

const subjectsByLevel: Record<string, { id: string, name: string, icon: string, topics?: string[] }[]> = {
  '9ème AF': [
    { id: 'kreyol', name: 'Kreyòl', icon: '🇭🇹' },
    { id: 'francais', name: 'Français', icon: '🇫🇷' },
    { id: 'math9', name: 'Matematik', icon: '📐' },
    { id: 'physnat', name: 'Syans Esperimantal', icon: '🔬', topics: ['Fizik', 'Chimi', 'Biyoloji'] },
    { id: 'social9', name: 'Syans Sosyal', icon: '🌍' },
  ],
  'NS4': [
    { id: 'math', name: 'Matematik', icon: '📐' },
    { id: 'physics', name: 'Fizik', icon: '⚡', topics: ['Elektrisite/Elanm', 'Mekanyk', 'Optik', 'Tèmodinamik', 'Vibrasyon'] },
    { id: 'chemistry', name: 'Chimi', icon: '🧪', topics: ['Chimiatik', 'Reyaksyon', 'Elektrochimi'] },
    { id: 'philosophy', name: 'Filozofi', icon: '🤔' },
    { id: 'biology', name: 'Biyoloji', icon: '🌿', topics: ['Selil', 'Jenetik', 'Fizyoloji'] },
    { id: 'history', name: 'Istwa', icon: '📜' },
    { id: 'social', name: 'Syans Sosyal', icon: '🌍' },
  ]
};

const years = ['2025 (SES)', '2025 (SMP-SVT)', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

const BacExamsInterface: React.FC<BacExamsInterfaceProps> = ({
  onStartExam, onGenerateQuiz, onMenuClick, isOffline,
  studentLevel = 'NS4', responseLanguage = Language.KREYOL,
  aiProvider, ollamaModel
}) => {
  const [activeTab, setActiveTab] = useState<'menfp' | 'library'>('menfp');
  const [selectedLevel, setSelectedLevel] = useState('NS4');
  const [selectedSubject, setSelectedSubject] = useState('Fizik');
  const [selectedYear, setSelectedYear] = useState('2025 (SES)');
  const [selectedTopic, setSelectedTopic] = useState('');

  const currentSubjects = subjectsByLevel[selectedLevel] || [];
  const currentSubject = currentSubjects.find(s => s.name === selectedSubject);
  const availableTopics = currentSubject?.topics || [];

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setSelectedSubject('');
    setSelectedTopic('');
  };

  const handleStart = () => { if (selectedSubject) onStartExam(selectedLevel, selectedSubject, selectedYear); };
  const handleGenerate = () => { if (selectedSubject && onGenerateQuiz) onGenerateQuiz(selectedLevel, selectedSubject, selectedYear); };

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
            📋
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Egzamen Leta</h2>
            <p className="text-sm font-medium text-white/80 mt-1">Pratike ak Database MENFP a!</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="shrink-0 px-4 pt-3 flex gap-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <button
          onClick={() => setActiveTab('menfp')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition-all border-b-2 -mb-px ${
            activeTab === 'menfp'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          style={{ color: activeTab === 'menfp' ? '' : 'var(--text-muted)' }}
        >
          🏛️ Quiz MENFP
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === 'library'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
              : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          style={{ color: activeTab === 'library' ? '' : 'var(--text-muted)' }}
        >
          📚 Bibliyotèk PDF
          <span className="px-1.5 py-0.5 rounded-full text-xs font-black bg-purple-500 text-white">62</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
        
        {/* Library Tab */}
        {activeTab === 'library' && (
          <ExamLibraryPanel
            studentLevel={studentLevel}
            responseLanguage={responseLanguage}
            aiProvider={aiProvider}
            ollamaModel={ollamaModel}
          />
        )}

        {/* MENFP Tab */}
        {activeTab === 'menfp' && <div className="max-w-5xl mx-auto space-y-6">
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl border-2"
            style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
            
            <div className="mb-8">
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-main)' }}>Prepare Egzamen w lan 🚀</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                AI a pwograme kòm yon korektè ofisyèl. Li ap montre w etap pa etap ki kote pèlen yo kache nan "choix multiples" yo.
              </p>
              {isOffline && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900/40">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Ou offline. Sèlman egzamen stoke lokalman yo ap mache.
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Left Column: Level & Subject */}
              <div className="lg:col-span-5 space-y-8">
                {/* Level */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">1</span>
                    <label className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Chwazi Nivo a</label>
                  </div>
                  <div className="flex gap-3">
                    {levels.map(level => (
                      <button key={level} onClick={() => handleLevelChange(level)}
                        className={`flex-1 py-3 rounded-2xl border-2 text-sm font-black transition-all duration-200
                          ${selectedLevel === level ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20 scale-[1.02]' : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                        style={{ borderColor: selectedLevel === level ? '' : 'rgba(255,255,255,0.1)', color: selectedLevel === level ? '' : 'var(--text-main)' }}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-black">2</span>
                    <label className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Chwazi Matyè a</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {currentSubjects.map((s) => (
                      <button key={s.id} onClick={() => setSelectedSubject(s.name)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200
                          ${selectedSubject === s.name ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-inner scale-[1.02]' : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        <span className="text-3xl drop-shadow-sm">{s.icon}</span>
                        <span className="text-xs font-black text-center" style={{ color: 'var(--text-main)' }}>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Year & Actions */}
              <div className="lg:col-span-7 space-y-8">
                {/* Year */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">3</span>
                    <label className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Chwazi Ane a</label>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {years.map((y) => (
                      <button key={y} onClick={() => setSelectedYear(y)}
                        className={`py-2.5 rounded-xl border-2 text-xs font-black transition-all duration-200
                          ${selectedYear === y ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-inner scale-105' : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                        style={{ borderColor: selectedYear === y ? '' : 'rgba(255,255,255,0.1)', color: selectedYear === y ? '' : 'var(--text-muted)' }}>
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topics */}
                {availableTopics.length > 0 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-black">+</span>
                      <label className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Espas Opsyonèl</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableTopics.map(topic => (
                        <button key={topic} onClick={() => setSelectedTopic(topic)}
                          className={`px-4 py-2 rounded-xl border-2 text-xs font-black transition-all duration-200
                            ${selectedTopic === topic ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 shadow-inner' : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                          style={{ borderColor: selectedTopic === topic ? '' : 'rgba(255,255,255,0.1)', color: selectedTopic === topic ? '' : 'var(--text-muted)' }}>
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 space-y-3">
                  <button onClick={handleStart} disabled={!selectedSubject || isOffline}
                    className={`w-full py-4 rounded-2xl font-black text-sm text-white transition-all duration-200 flex items-center justify-center gap-2
                      ${(selectedSubject && !isOffline) ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98]' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50'}`}
                  >
                    🚀 Kòmanse Egzamen Modèl MENFP
                  </button>
                  <button onClick={handleGenerate} disabled={!selectedSubject}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all duration-200 border-2 flex items-center justify-center gap-2
                      ${selectedSubject ? 'hover:bg-black/5 dark:hover:bg-white/5 hover:scale-[1.01] active:scale-[0.98]' : 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-50 border-transparent'}`}
                    style={{ borderColor: selectedSubject ? 'rgba(255,255,255,0.1)' : '', color: selectedSubject ? 'var(--text-main)' : '' }}
                  >
                    📝 Chaje yon sèl Quiz: {selectedSubject || '...'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '💡', title: 'Konsèy Pèlen', text: 'AI a pral detekte kote distraksyon yo ye nan egzamen yo.' },
              { icon: '🎓', title: 'Nivo Adapte', text: 'Chanje nivo a pou w wè kijan apwòch 9ème AF diferan ak NS4.' },
              { icon: '⚡', title: 'Analiz Pwofon', text: 'Sèvi ak eksplikasyon "etap pa etap" yo pou metriz ou.' }
            ].map(info => (
              <div key={info.title} className="p-5 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <span className="text-3xl mb-3 block">{info.icon}</span>
                <h4 className="text-sm font-black mb-1.5" style={{ color: 'var(--text-main)' }}>{info.title}</h4>
                <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>{info.text}</p>
              </div>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
};

export default BacExamsInterface;
