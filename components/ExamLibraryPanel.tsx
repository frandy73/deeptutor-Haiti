import React, { useState, useCallback } from 'react';
import { ExamEntry, EXAM_LIBRARY, getAvailableYears, getAvailableTracks } from '../services/examLibraryService';
import { extractTextFromPDFUrl } from '../services/pdfService';
import { getAIResponse } from '../services/aiService';
import { Language, ModuleType, Quiz, AIProvider } from '../types';

interface ExamLibraryPanelProps {
  studentLevel: string;
  responseLanguage: Language;
  aiProvider?: AIProvider;
  ollamaModel?: string;
  onQuizReady?: (quiz: Quiz, examTitle: string) => void;
}

type ActionMode = 'none' | 'loading' | 'quiz' | 'lesson' | 'error';

const ExamLibraryPanel: React.FC<ExamLibraryPanelProps> = ({
  studentLevel,
  responseLanguage,
  aiProvider,
  ollamaModel,
  onQuizReady,
}) => {
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamEntry | null>(null);
  const [actionMode, setActionMode] = useState<ActionMode>('none');
  const [statusMsg, setStatusMsg] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [lessonText, setLessonText] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const allYears = ['all', ...getAvailableYears()];
  const allTracks = ['all', ...getAvailableTracks()];

  const filteredExams = EXAM_LIBRARY.filter(exam => {
    const matchYear = filterYear === 'all' || exam.year === filterYear || exam.year.startsWith(filterYear);
    const matchTrack = filterTrack === 'all' || exam.track === filterTrack;
    const matchSearch = !searchQuery ||
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchYear && matchTrack && matchSearch;
  });

  const handleGenerateQuiz = useCallback(async (exam: ExamEntry) => {
    setSelectedExam(exam);
    setActionMode('loading');
    setStatusMsg('⏳ Ap ekstrè tèks PDF la...');
    setGeneratedQuiz(null);
    setLessonText('');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);

    try {
      const result = await extractTextFromPDFUrl(exam.pdfPath);
      setStatusMsg('🤖 AI ap jenere quiz a...');

      const prompt = `Jenere yon quiz sou egzamen Bac Haiti sa a: "${exam.title}" — Sijè: ${exam.topic}, Pis: ${exam.track}, Ane: ${exam.year}.
      
Kontni egzamen an:
${result.text.substring(0, 8000)}

Jenere 5 kesyon difisil ki teste konpreyansyon pwofon elèv la. Pou chak kesyon, mete yon pèlen (MENFP trap) nan eksplikasyon an.`;

      let fullResponse = '';
      const rawResponse = await getAIResponse({
        prompt,
        selectedModule: ModuleType.BAC_EXAMS,
        studentLevel,
        responseLanguage,
        onChunk: () => {},
        isQuizRequest: true,
        knowledgeContext: result.text.substring(0, 6000),
        aiProvider,
        ollamaModel,
      });
      fullResponse = rawResponse;

      const parsed = JSON.parse(fullResponse) as Quiz;
      setGeneratedQuiz(parsed);
      setActionMode('quiz');
      if (onQuizReady) onQuizReady(parsed, exam.title);
    } catch (err: any) {
      setActionMode('error');
      setStatusMsg(`❌ Erè: ${err.message || 'Echèk jenererasyon quiz la'}`);
    }
  }, [studentLevel, responseLanguage, aiProvider, ollamaModel, onQuizReady]);

  const handleGenerateLesson = useCallback(async (exam: ExamEntry) => {
    setSelectedExam(exam);
    setActionMode('loading');
    setStatusMsg('⏳ Ap ekstrè tèks PDF la...');
    setGeneratedQuiz(null);
    setLessonText('');

    try {
      const result = await extractTextFromPDFUrl(exam.pdfPath);
      setStatusMsg('📚 AI ap prepare leson an...');

      const prompt = `Esplike de fason trè klè ak enteresan sijè egzamen Bac Haiti sa a: "${exam.title}" — ${exam.topic}.
      
Baze sou kontni PDF la:
${result.text.substring(0, 6000)}

Fè yon leson pou yon elèv NS4 oswa 9è AF. Itilize:
1. Definisyon klè
2. Fòmil enpòtan
3. Egzanp pratik
4. Konsèy pou egzamen
5. Pèlen klasik MENFP yo`;

      let lessonContent = '';
      await getAIResponse({
        prompt,
        selectedModule: ModuleType.BAC_EXAMS,
        studentLevel,
        responseLanguage,
        onChunk: (chunk) => {
          lessonContent += chunk;
          setLessonText(lessonContent);
        },
        knowledgeContext: result.text.substring(0, 6000),
        aiProvider,
        ollamaModel,
      });

      setActionMode('lesson');
    } catch (err: any) {
      setActionMode('error');
      setStatusMsg(`❌ Erè: ${err.message || 'Echèk kreye leson an'}`);
    }
  }, [studentLevel, responseLanguage, aiProvider, ollamaModel]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    if (generatedQuiz) {
      const correct = generatedQuiz.questions[currentQuestionIndex].correctAnswer;
      if (answer === correct) setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!generatedQuiz) return;
    if (currentQuestionIndex < generatedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const trackColors: Record<string, string> = {
    'SES': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'SMP-SVT': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Philo A': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Philo C-D': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    'NS4': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    '9ème AF': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  };

  // ─── Quiz Mode ───────────────────────────────────────────────────────────────
  if (actionMode === 'quiz' && generatedQuiz) {
    const isFinished = currentQuestionIndex >= generatedQuiz.questions.length - 1 && showResult;
    const q = generatedQuiz.questions[currentQuestionIndex];
    const pct = Math.round(((currentQuestionIndex + (showResult ? 1 : 0)) / generatedQuiz.questions.length) * 100);

    return (
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => { setActionMode('none'); setSelectedExam(null); }}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all"
            style={{ color: 'var(--text-muted)' }}>
            ← Retounen
          </button>
          <div className="flex-1">
            <h3 className="text-sm font-black truncate" style={{ color: 'var(--text-main)' }}>{generatedQuiz.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                {currentQuestionIndex + 1}/{generatedQuiz.questions.length}
              </span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl font-black text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
            {score} pts
          </div>
        </div>

        {isFinished ? (
          <div className="text-center py-10 space-y-4">
            <div className="text-6xl">{score >= generatedQuiz.questions.length * 0.7 ? '🎉' : score >= generatedQuiz.questions.length * 0.4 ? '💪' : '📚'}</div>
            <h3 className="text-2xl font-black" style={{ color: 'var(--text-main)' }}>
              {score}/{generatedQuiz.questions.length} Kòrèk!
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {score >= generatedQuiz.questions.length * 0.7 ? 'Ekselan! Ou prè pou Bac la!' : 'Kontinye pratike! Ou ap amelyore!'}
            </p>
            <button onClick={() => { setActionMode('none'); setSelectedExam(null); }}
              className="px-6 py-3 rounded-2xl font-black text-white text-sm bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
              Chwazi yon lòt Egzamen
            </button>
          </div>
        ) : (
          <div className="rounded-3xl p-6 border-2 space-y-5" style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-base font-bold leading-relaxed" style={{ color: 'var(--text-main)' }}>{q.question}</p>
            <div className="space-y-3">
              {/* Since AI quiz has free-text answer, show correct vs wrong */}
              {showResult ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-400">
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-1">✅ Repons Kòrèk:</p>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{q.correctAnswer}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-black text-amber-600 dark:text-amber-400 mb-1">💡 Eksplikasyon:</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{q.explanation}</p>
                  </div>
                  {!isFinished && (
                    <button onClick={handleNextQuestion}
                      className="w-full py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md hover:shadow-lg transition-all">
                      Pwochen Kesyon →
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Eske ou konnen repons lan?</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleAnswer(q.correctAnswer)}
                      className="flex-1 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md hover:shadow-lg transition-all">
                      ✅ Wi, mwen konnen!
                    </button>
                    <button onClick={() => { setSelectedAnswer('wrong'); setShowResult(true); }}
                      className="flex-1 py-3 rounded-2xl font-black text-sm border-2 transition-all hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                      ❓ Montre repons lan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Lesson Mode ─────────────────────────────────────────────────────────────
  if (actionMode === 'lesson') {
    return (
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => { setActionMode('none'); setSelectedExam(null); setLessonText(''); }}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all"
            style={{ color: 'var(--text-muted)' }}>
            ← Retounen
          </button>
          <h3 className="text-sm font-black" style={{ color: 'var(--text-main)' }}>
            📚 {selectedExam?.title}
          </h3>
        </div>
        <div className="rounded-3xl p-6 border-2 prose prose-sm max-w-none"
          style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}>
          {lessonText ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{lessonText}</div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>AI ap prepare leson an...</p>
            </div>
          )}
        </div>
        {lessonText && (
          <button onClick={() => handleGenerateQuiz(selectedExam!)}
            className="w-full py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md hover:shadow-lg transition-all">
            🎯 Kounye a Teste Konesans ou avèk yon Quiz!
          </button>
        )}
      </div>
    );
  }

  // ─── Loading Mode ─────────────────────────────────────────────────────────────
  if (actionMode === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">📄</span>
        </div>
        <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{statusMsg}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedExam?.title}</p>
      </div>
    );
  }

  // ─── Error Mode ─────────────────────────────────────────────────────────────
  if (actionMode === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <span className="text-5xl">😔</span>
        <p className="text-sm font-bold text-red-500">{statusMsg}</p>
        <button onClick={() => setActionMode('none')}
          className="px-6 py-3 rounded-2xl font-black text-sm border-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}>
          ← Eseye Ankò
        </button>
      </div>
    );
  }

  // ─── Main Library View ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Search + Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Chèche egzamen (ex: induction, gravite, 2022...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            style={{
              background: 'rgba(22, 29, 51, 0.85)',
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'var(--text-main)',
            }}
          />
        </div>

        {/* Filter: Years */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Ane</p>
          <div className="flex flex-wrap gap-2">
            {allYears.slice(0, 8).map(y => (
              <button key={y} onClick={() => setFilterYear(y)}
                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black transition-all duration-200
                  ${filterYear === y ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={{ borderColor: filterYear === y ? '' : 'rgba(255,255,255,0.1)', color: filterYear === y ? '' : 'var(--text-muted)' }}>
                {y === 'all' ? 'Tout Ane' : y}
              </button>
            ))}
          </div>
        </div>

        {/* Filter: Track */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Pis / Seksyon</p>
          <div className="flex flex-wrap gap-2">
            {allTracks.map(t => (
              <button key={t} onClick={() => setFilterTrack(t)}
                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black transition-all duration-200
                  ${filterTrack === t ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={{ borderColor: filterTrack === t ? '' : 'rgba(255,255,255,0.1)', color: filterTrack === t ? '' : 'var(--text-muted)' }}>
                {t === 'all' ? 'Tout Pis' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
          {filteredExams.length} egzamen jwenn
        </p>
        {(filterYear !== 'all' || filterTrack !== 'all' || searchQuery) && (
          <button onClick={() => { setFilterYear('all'); setFilterTrack('all'); setSearchQuery(''); }}
            className="text-xs font-black text-indigo-500 hover:text-indigo-600 transition-colors">
            ✕ Efase filtè yo
          </button>
        )}
      </div>

      {/* Exam Grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {filteredExams.map(exam => (
          <div key={exam.id}
            className="group relative rounded-2xl border-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-default"
            style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
            
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{exam.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black leading-tight truncate" style={{ color: 'var(--text-main)' }}>
                  {exam.title}
                </h4>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${trackColors[exam.track] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    {exam.track}
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{exam.year}</span>
                  {exam.isOfficial && (
                    <span className="px-1.5 py-0.5 rounded text-xs font-black bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                      ✓ Ofisyèl
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Topic */}
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              📖 {exam.topic}
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleGenerateLesson(exam)}
                className="flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                📚 Leson
              </button>
              <button
                onClick={() => handleGenerateQuiz(exam)}
                className="flex-1 py-2 rounded-xl text-xs font-black text-white transition-all shadow-md hover:shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                🎯 Quiz AI
              </button>
              <a
                href={exam.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-xs font-black border-2 transition-all hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
                title="Ouvri PDF la">
                📄
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <span className="text-5xl">🔍</span>
          <p className="font-bold" style={{ color: 'var(--text-muted)' }}>Pa gen egzamen ki koresponn ak filtè ou yo.</p>
          <button onClick={() => { setFilterYear('all'); setFilterTrack('all'); setSearchQuery(''); }}
            className="text-sm font-black text-indigo-500 hover:underline">
            Efase tout filtè
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamLibraryPanel;
