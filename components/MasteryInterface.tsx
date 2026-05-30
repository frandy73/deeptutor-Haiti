import React, { useState, useEffect, useCallback } from 'react';
import { ModuleType, Language, Subject, StudentProgress, KnowledgeFile } from '../types';
import { getAIResponse } from '../services/aiService';
import { loadProgress, markTopicAsMastered, loadKnowledgeFiles } from '../services/localStorageService';
import { getFileText } from '../services/dbService';
import { XP_REWARDS, SUBJECT_LABELS } from '../constants';

interface MasteryInterfaceProps {
  onMenuClick?: () => void;
  selectedPDFText?: string;
  selectedPDFName?: string;
  studentLevel?: string;
  responseLanguage?: Language;
}

interface MasteryLessonJSON {
  lessonChunk: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const PRESET_TOPICS = [
  { id: 'fraksyon', title: 'Fraksyon ak Pataje (Fractions)', subject: Subject.MATHEMATIQUES, desc: 'Aprann kouman pou divize ak kalkile fraksyon fasil.' },
  { id: 'ekwasyon_1', title: 'Ekwasyon 1ye Degre', subject: Subject.MATHEMATIQUES, desc: 'Jwenn valè x ki enkoni nan ekwasyon senp.' },
  { id: 'teyorèm_pitago', title: 'Teyorèm Pitagò (Théorème de Pythagore)', subject: Subject.MATHEMATIQUES, desc: 'Kalkile kote ki manke nan yon triyang dwat.' },
  { id: 'lwa_newton', title: 'Lwa Newton yo (Lois de Newton)', subject: Subject.PHYSIQUE, desc: 'Konprann kouman fòs ak mouvman ap travay.' },
  { id: 'eneji_sinetik', title: 'Enèji Sinetik ak Potansyèl', subject: Subject.PHYSIQUE, desc: 'Kalkile enèji yon bagay ki ap deplase.' },
  { id: 'revolisyon_1804', title: 'Revolisyon Ayisyen 1804', subject: Subject.HISTOIRE, desc: 'Kouman zansèt nou yo te konbat pou libète nou.' },
  { id: 'otograf_kreyol', title: 'Règ Òtograf Kreyòl 1979', subject: Subject.KREYOL, desc: 'Aprann ekri lang kreyòl la san erè.' },
  { id: 'disertasyon_fr', title: 'Estrikti Disètasyon (Dissertation)', subject: Subject.FRANCAIS, desc: 'Metodoloji pou fè yon bèl disètasyon lekòl.' },
];

const MasteryInterface: React.FC<MasteryInterfaceProps> = ({ 
  onMenuClick, 
  selectedPDFText, 
  selectedPDFName,
  studentLevel = '9ème AF',
  responseLanguage = Language.KREYOL
}) => {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [kbFiles, setKbFiles] = useState<KnowledgeFile[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeSourceText, setActiveSourceText] = useState<string | null>(null);
  
  // Quest state
  const [questState, setQuestState] = useState<'overview' | 'loading' | 'quest' | 'completed'>('overview');
  const [stage, setStage] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Lesson state
  const [lessonChunk, setLessonChunk] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  
  // Interaction state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Confetti particles for success
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  useEffect(() => {
    setProgress(loadProgress());
    setKbFiles(loadKnowledgeFiles());
    
    // If a PDF text is passed directly from Knowledge Base, auto-select it!
    if (selectedPDFText && selectedPDFName) {
      handleStartQuest(selectedPDFName, selectedPDFText);
    }
  }, [selectedPDFText, selectedPDFName]);

  const fetchLesson = async (topicTitle: string, sourceText: string | null, currentStage: number, isRemedial: boolean = false, wrongAnswer?: string, rightAnswer?: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(null);

    const lang = responseLanguage;

    let prompt = '';
    if (!isRemedial) {
      prompt = `Esplike konsèp sa a oswa pati sa a nan leson an pou mwen. Mwen vle aprann etap pa etap.
Nivo mwen se: ${studentLevel}. Lang mwen se: ${lang === Language.KREYOL ? 'Kreyòl Ayisyen' : 'Français'}.
Sijè a se: "${topicTitle}". Sa a se etap ${currentStage} sou 3 nivo nan aprantisaj sa a.
Fè esplikasyon an trè kout, enteresan, senp, epi sèvi ak yon bèl analoji pratik ki pale ak kilti oswa lavi chak jou an Ayiti pou fè timoun konprann trè fasil.
Touswit apre esplikasyon an, ou DWE poze yon kesyon chwa miltip (A, B, C, D) pou tcheke si mwen konprann sa ou fenk esplike a.
Bay repons lan sèlman an fòma JSON ki genyen kle sa yo: lessonChunk, question, options (yon lis 4 opsyon chwa miltip kòmanse pa "A) ...", "B) ..."), correctAnswer ("A", "B", "C" oswa "D"), ak explanation (eksplikasyon repons la).`;
    } else {
      prompt = `Mwen te fè erè nan kesyon presedan an. Mwen te chwazi: "${wrongAnswer}". Repons kòrèk la se te: "${rightAnswer}".
Tanpri, eksplike menm konsèp sa a ankò nan yon fason KI PI SENP TOUJOU e KI PI KOUT.
Itilize yon analoji konplètman diferan nan lavi chak jou an Ayiti (pa egzanp: vwayaj nan tap-tap, komès machann nan mache, pataje mango, prepare manje, elatriye).
Apre sa, poze m yon nouvo kesyon chwa miltip (A, B, C, D) ki pi fasil toujou pou verifye si mwen konprann kounye a.
Bay repons lan sèlman an fòma JSON ki genyen kle sa yo: lessonChunk (nouvo esplikasyon pi senp lan), question, options, correctAnswer, ak explanation.`;
    }

    try {
      const responseText = await getAIResponse({
        prompt,
        selectedModule: ModuleType.MASTER_LESSON,
        studentLevel,
        responseLanguage: lang,
        onChunk: () => {},
        isMasteryRequest: true,
        knowledgeContext: sourceText || undefined,
        officialContextEnabled: true
      });

      // Parse JSON safely
      const parsed: MasteryLessonJSON = JSON.parse(responseText.trim());
      setLessonChunk(parsed.lessonChunk);
      setQuestion(parsed.question);
      setOptions(parsed.options);
      setCorrectAnswer(parsed.correctAnswer.trim().toUpperCase());
      setExplanation(parsed.explanation);
      setQuestState('quest');
    } catch {
      setError('Eskize m, gen yon ti erè rezo ki pase. Klike sou bouton ki anba a pou re-eseye leson sa a.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuest = async (topicTitle: string, sourceText: string | null) => {
    setActiveTopic(topicTitle);
    setActiveSourceText(sourceText);
    setQuestState('loading');
    setStage(1);
    setStreak(0);
    await fetchLesson(topicTitle, sourceText, 1);
  };

  const handleOptionSelect = (opt: string) => {
    if (submitted) return;
    setSelectedOption(opt);
  };

  const handleSubmit = () => {
    if (!selectedOption || submitted) return;
    
    const parsedOptionLetter = selectedOption.trim().charAt(0).toUpperCase();
    const parsedCorrectLetter = correctAnswer.trim().charAt(0).toUpperCase();
    
    const correct = parsedOptionLetter === parsedCorrectLetter;
    
    setSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      if (newStreak >= 3) {
        // Mastery complete!
        triggerConfetti();
        const updatedProgress = markTopicAsMastered(activeTopic!);
        setProgress(updatedProgress);
        setQuestState('completed');
      }
    } else {
      // Failed - reset streak or keep it flat
      setStreak(0);
    }
  };

  const handleNextStage = async () => {
    const nextStage = stage + 1;
    setStage(nextStage);
    setQuestState('loading');
    await fetchLesson(activeTopic!, activeSourceText, nextStage);
  };

  const handleRemediate = async () => {
    setQuestState('loading');
    await fetchLesson(activeTopic!, activeSourceText, stage, true, selectedOption!, correctAnswer);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 6000);
  };

  const handleSelectPDF = async (file: KnowledgeFile) => {
    setQuestState('loading');
    try {
      const text = await getFileText(file.id);
      if (!text) {
        alert('Fichye sa a pa gen tèks ekstrè. Tanpri chwazi yon lòt fichye.');
        setQuestState('overview');
        return;
      }
      handleStartQuest(file.name, text);
    } catch {
      alert('Erè lè n ap li fichye a.');
      setQuestState('overview');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative" style={{ background: 'var(--surface-container-lowest)' }}>
      
      {/* Confetti CSS Overlay */}
      {showConfetti && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden flex flex-wrap justify-around">
          {[...Array(50)].map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 3 + 2;
            const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            return (
              <div
                key={i}
                className="absolute top-0 w-2.5 h-2.5 rounded-full animate-bounce"
                style={{
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  backgroundColor: randomColor,
                  transform: `translateY(-20px) rotate(${Math.random() * 360}deg)`,
                  animationName: 'fall',
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'linear'
                }}
              />
            );
          })}
          <style>{`
            @keyframes fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <button onClick={onMenuClick} className="md:hidden p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-all text-white border border-white/10 shrink-0">
                ☰
              </button>
            )}
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl shadow-lg shrink-0">
              🏆
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Mèt Leson</h2>
              <p className="text-sm font-medium text-white/80 mt-1">Mòd Aprantisaj Adaptif — metrize leson ou yo nèt!</p>
            </div>
          </div>
          
          {questState !== 'overview' && (
            <button
              onClick={() => setQuestState('overview')}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-1.5"
            >
              <span>🏠</span> <span className="hidden sm:inline">Kite Leson</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
        
        {/* 1. OVERVIEW SCREEN */}
        {questState === 'overview' && (
          <div className="max-w-5xl mx-auto w-full space-y-6 animate-fadeIn">
            
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl p-5 border flex items-center gap-4" style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl font-black shrink-0">
                  🏆
                </div>
                <div>
                  <h4 className="text-sm font-black m-0" style={{ color: 'var(--text-muted)' }}>Sijè Metrize</h4>
                  <p className="text-2xl font-black m-0 mt-0.5" style={{ color: 'var(--text-main)' }}>
                    {progress?.masteredTopics?.length || 0}
                  </p>
                </div>
              </div>
              
              <div className="rounded-2xl p-5 border flex items-center gap-4" style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl font-black shrink-0">
                  ⭐
                </div>
                <div>
                  <h4 className="text-sm font-black m-0" style={{ color: 'var(--text-muted)' }}>Mastery XP</h4>
                  <p className="text-2xl font-black m-0 mt-0.5" style={{ color: 'var(--text-main)' }}>
                    {progress?.masteryXp || 0} XP
                  </p>
                </div>
              </div>
              
              <div className="rounded-2xl p-5 border flex items-center gap-4" style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl font-black shrink-0">
                  🎯
                </div>
                <div>
                  <h4 className="text-sm font-black m-0" style={{ color: 'var(--text-muted)' }}>Nivo Elèv</h4>
                  <p className="text-2xl font-black m-0 mt-0.5" style={{ color: 'var(--text-main)' }}>
                    {studentLevel}
                  </p>
                </div>
              </div>
            </div>

            {/* Explanatory Banner */}
            <div className="rounded-3xl p-6 border-2 border-dashed relative overflow-hidden flex gap-5 sm:gap-6 items-center" 
                 style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'var(--primary)' }}>
              <div className="text-5xl shrink-0 animate-pulse">💡</div>
              <div className="flex-1">
                <h3 className="m-0 text-base sm:text-lg font-black uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Kòman sa travay?
                </h3>
                <p className="m-0 text-xs sm:text-sm font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Chwazi yon sijè pi ba a oubyen chwazi youn nan dokiman PDF ou telechaje yo. AI a pral eksplike konsèp yo an kreyòl senp. Chak fwa ou reponn kesyon yo kòrèkteman, ou pral jwenn **XP** epi si ou reponn 3 kesyon kòrèkteman youn apre lòt, ou pral **metrize sijè a** nèt!
                </p>
              </div>
            </div>

            {/* PRESET TOPICS GRID */}
            <div>
              <h3 className="font-black text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                📚 Sijè Ofisyèl MENFP
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_TOPICS.map(topic => {
                  const isMastered = progress?.masteredTopics?.includes(topic.title);
                  return (
                    <div
                      key={topic.id}
                      onClick={() => handleStartQuest(topic.title, null)}
                      className={`rounded-2xl p-5 border-2 text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg flex justify-between items-start gap-4 group
                        ${isMastered ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 bg-rgba(22,29,51,0.85) hover:border-indigo-500/50'}`}
                      style={{ background: 'rgba(22, 29, 51, 0.85)' }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            {SUBJECT_LABELS[topic.subject]}
                          </span>
                          {isMastered && (
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <span>✅</span> Metrize
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-black truncate m-0" style={{ color: 'var(--text-main)' }}>
                          {topic.title}
                        </h4>
                        <p className="text-xs font-medium m-0 mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {topic.desc}
                        </p>
                      </div>
                      
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center text-lg shadow-sm transition-all shrink-0">
                        ⚡
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PDF FILES LIST */}
            {kbFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-black text-lg flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                  📄 Chwazi nan PDF ou yo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kbFiles.map(file => {
                    const isMastered = progress?.masteredTopics?.includes(file.name);
                    return (
                      <div
                        key={file.id}
                        onClick={() => handleSelectPDF(file)}
                        className={`rounded-2xl p-5 border-2 text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg flex justify-between items-center gap-4 group
                          ${isMastered ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 bg-rgba(22,29,51,0.85) hover:border-indigo-500/50'}`}
                        style={{ background: 'rgba(22, 29, 51, 0.85)' }}
                      >
                        <div className="min-w-0 flex-1 flex items-center gap-3">
                          <div className="text-3xl shrink-0">📄</div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black truncate m-0" style={{ color: 'var(--text-main)' }} title={file.name}>
                              {file.name}
                            </h4>
                            <p className="text-[10px] font-medium m-0 mt-1" style={{ color: 'var(--text-muted)' }}>
                              {file.pageCount || '?'} paj — telechaje nan Baz Konesans
                            </p>
                          </div>
                        </div>
                        {isMastered ? (
                          <div className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            Metrize ✅
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            Aprann
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* 2. LOADING SCREEN */}
        {questState === 'loading' && (
          <div className="max-w-2xl mx-auto w-full py-16 text-center space-y-6 animate-pulse">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-4xl shadow-md">
              ⏳
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black" style={{ color: 'var(--text-main)' }}>
                {stage === 1 && streak === 0 ? 'Pwof Ou ap prepare leson an...' : 'Ap chaje pwochen nivo a...'}
              </h3>
              <p className="text-sm font-medium max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                N ap analize sijè a epi n ap prepare yon esplikasyon trè senp ak analoji ayisyen pou ou!
              </p>
            </div>
            
            {/* Fake loader items */}
            <div className="space-y-3 max-w-md mx-auto pt-6">
              <div className="h-4 rounded-full bg-slate-200 dark:bg-slate-800 w-3/4 mx-auto" />
              <div className="h-4 rounded-full bg-slate-200 dark:bg-slate-800 w-5/6 mx-auto" />
              <div className="h-4 rounded-full bg-slate-200 dark:bg-slate-800 w-1/2 mx-auto" />
            </div>
          </div>
        )}

        {/* 3. LESSON QUEST ACTIVE SCREEN */}
        {questState === 'quest' && (
          <div className="max-w-3xl mx-auto w-full space-y-6 animate-fadeIn">
            
            {/* Progress indicator */}
            <div className="rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                 style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div>
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Sijè Aktyèl</p>
                <h4 className="text-base font-black truncate m-0 mt-0.5" style={{ color: 'var(--text-main)' }}>
                  {activeTopic}
                </h4>
              </div>
              
              {/* Progress bars / Stages */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(step => {
                  const active = step <= streak;
                  return (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border transition-all duration-300
                          ${active ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}
                      >
                        {active ? '✅' : step}
                      </div>
                      {step < 3 && (
                        <div className={`w-6 h-1 rounded-full transition-all duration-300 ${step < streak ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
                <p className="m-0 mb-3">{error}</p>
                <button
                  onClick={() => fetchLesson(activeTopic!, activeSourceText, stage)}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white transition-all shadow-md"
                >
                  🔄 Re-eseye kounye a
                </button>
              </div>
            )}

            {!error && (
              <>
                {/* LESSON CHUNK CARD */}
                <div className="rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden transition-all"
                     style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📖</span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-indigo-500">Esplikasyon Senp</span>
                  </div>
                  
                  <div className="text-base sm:text-lg font-medium leading-relaxed space-y-4" style={{ color: 'var(--text-main)' }}>
                    {lessonChunk.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="m-0 whitespace-pre-line">{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* QUESTION CARD */}
                <div className="rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden"
                     style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🤔</span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-amber-500">Kesyon Konpreyansyon</span>
                  </div>

                  <p className="text-base sm:text-lg font-black leading-snug mb-5" style={{ color: 'var(--text-main)' }}>
                    {question}
                  </p>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {options.map((opt, i) => {
                      const optLetter = opt.trim().charAt(0).toUpperCase();
                      const isSelected = selectedOption === opt;
                      const optCorrectLetter = correctAnswer.trim().charAt(0).toUpperCase();
                      const isOptCorrect = optLetter === optCorrectLetter;
                      
                      let cardStyle = {
                        background: 'rgba(22, 29, 51, 0.85)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: 'var(--text-main)',
                      };

                      if (isSelected) {
                        cardStyle = {
                          background: 'rgba(79, 70, 229, 0.05)',
                          borderColor: '#4f46e5',
                          color: '#4f46e5',
                        };
                      }

                      if (submitted) {
                        if (isOptCorrect) {
                          cardStyle = {
                            background: 'rgba(16, 185, 129, 0.08)',
                            borderColor: '#10b981',
                            color: '#10b981',
                          };
                        } else if (isSelected) {
                          cardStyle = {
                            background: 'rgba(239, 68, 68, 0.08)',
                            borderColor: '#ef4444',
                            color: '#ef4444',
                          };
                        }
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleOptionSelect(opt)}
                          disabled={submitted}
                          className="w-full text-left p-4 rounded-2xl border-2 transition-all hover:scale-[1.005] active:scale-95 flex items-center justify-between gap-3 font-bold text-sm"
                          style={cardStyle}
                        >
                          <span className="leading-relaxed">{opt}</span>
                          
                          {submitted && isOptCorrect && (
                            <span className="text-emerald-500 shrink-0 font-black">✓ Bon</span>
                          )}
                          {submitted && isSelected && !isOptCorrect && (
                            <span className="text-red-500 shrink-0 font-black">✗ Mal</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  {!submitted && (
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedOption}
                      className={`w-full mt-6 py-3.5 rounded-2xl font-black text-white shadow-md transition-all flex items-center justify-center gap-2
                        ${selectedOption ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95' : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                      <span>🎯</span> Soumèt Repons
                    </button>
                  )}
                </div>

                {/* FEEDBACK BANNERS */}
                {submitted && (
                  <div className="animate-fadeIn">
                    {isCorrect ? (
                      <div className="rounded-3xl p-6 sm:p-8 border-2 shadow-lg space-y-4 text-emerald-800 dark:text-emerald-300"
                           style={{ background: 'rgba(16, 185, 129, 0.06)', borderColor: '#10b981' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🎉</span>
                          <div>
                            <h3 className="m-0 text-lg font-black uppercase tracking-wide">Repons lan kòrèk!</h3>
                            <p className="m-0 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Joli travay! Ou pran plis asirans.</p>
                          </div>
                        </div>
                        
                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-main)' }}>
                          {explanation}
                        </p>

                        {streak < 3 && (
                          <button
                            onClick={handleNextStage}
                            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                          >
                            <span>Avanse nan pwochen pati a</span> <span>🚀</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-3xl p-6 sm:p-8 border-2 shadow-lg space-y-4 text-amber-800 dark:text-amber-300"
                           style={{ background: 'rgba(245, 158, 11, 0.06)', borderColor: '#f59e0b' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🔄</span>
                          <div>
                            <h3 className="m-0 text-lg font-black uppercase tracking-wide">Repons lan pa kòrèk</h3>
                            <p className="m-0 text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">Sa pa fè anyen! Se konsa nou aprann.</p>
                          </div>
                        </div>
                        
                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-main)' }}>
                          {explanation}
                        </p>

                        <button
                          onClick={handleRemediate}
                          className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <span>Eseye yon lòt eksplikasyon</span> <span>🔄</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* 4. QUEST COMPLETED CELEBRATION SCREEN */}
        {questState === 'completed' && (
          <div className="max-w-2xl mx-auto w-full py-10 text-center space-y-6 animate-scaleIn">
            
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-6xl shadow-xl animate-bounce">
              🏆
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                Sijè sa a Maîtrisé! 🟢
              </h2>
              <p className="text-base font-bold" style={{ color: 'var(--text-main)' }}>
                Felisitasyon! Ou metrize sijè a nèt:
              </p>
              <p className="text-lg font-black text-indigo-500 bg-indigo-500/5 py-2 px-4 rounded-full max-w-md mx-auto truncate border border-indigo-500/10">
                {activeTopic}
              </p>
            </div>

            {/* Rewards Card */}
            <div className="rounded-3xl p-6 border max-w-sm mx-auto shadow-md space-y-4"
                 style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Rekonpans ou</p>
              
              <div className="flex justify-around items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl">⭐</div>
                  <p className="text-lg font-black m-0 mt-1 text-emerald-500">+{XP_REWARDS.MASTERY_QUEST_COMPLETED} XP</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">XP Metrize</p>
                </div>
                <div className="w-px h-12 bg-slate-200 dark:bg-slate-800" />
                <div className="text-center">
                  <div className="text-3xl">🎖️</div>
                  <p className="text-lg font-black m-0 mt-1 text-indigo-500">Badge</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Mèt Sijè</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setQuestState('overview')}
                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95"
              >
                🏠 Retounen nan Sijè yo
              </button>
              
              <button
                onClick={() => handleStartQuest(activeTopic!, activeSourceText)}
                className="px-6 py-3.5 rounded-2xl border-2 transition-all hover:bg-black/5 dark:hover:bg-white/5 font-black text-sm"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
              >
                🔄 Re-kòmanse Defi sa a
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default MasteryInterface;
