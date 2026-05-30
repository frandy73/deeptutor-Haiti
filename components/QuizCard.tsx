import React, { useState } from 'react';
import { Quiz, QuizQuestion } from '../types';
import { downloadWorksheet } from '../services/worksheetService';
import { notifySuccess } from '../services/notificationService';

interface QuizCardProps {
  quizData: Quiz;
  onRegenerateQuiz: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quizData, onRegenerateQuiz }) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    const answered = Object.keys(userAnswers).length;
    notifySuccess('📝 Egzèsis fini!', `Ou reponn ${answered} kesyon. Tcheke koreksyon yo.`);
  };

  const handleDownload = () => {
    // Convert Quiz to Worksheet format
    const worksheet = {
      title: quizData.title || "Fèy Egzèsis Pwof Ou",
      subject: "Matyè Jeneral", 
      level: "Nivo Etidyan",
      instructions: "Tanpri reponn tout kesyon yo kòmsadwa.",
      exercises: quizData.questions.map(q => ({
        id: q.id,
        question: q.question,
        answer: q.correctAnswer
      }))
    };
    downloadWorksheet(worksheet);
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="w-full max-w-full p-4 rounded-2xl shadow-md border-2" style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}>
        <h3 className="text-xl font-black mb-3" style={{ color: 'var(--accent-main)' }}>{quizData.title || "Egzèsis Entèaktif"}</h3>
        <p className="mb-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Eseye reponn kesyon sa yo. Lè w fin ranpli, klike sou "Soumèt Repons" pou w wè rezilta w.</p>

        <form onSubmit={(e) => e.preventDefault()}>
          {quizData.questions.map((q, index) => (
            <div key={q.id} className="mb-5 p-3 rounded-xl border" style={{ background: 'var(--surface-container)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <p className="font-bold mb-2" style={{ color: 'var(--text-main)' }}>
                {index + 1}. {q.question}
              </p>
              <textarea
                value={userAnswers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border-2 focus:outline-none focus:ring-2 resize-y font-medium"
                style={{ 
                  background: 'rgba(22, 29, 51, 0.85)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  color: 'var(--text-main)',
                  minHeight: '80px'
                }}
                placeholder="Ekri repons ou isit la..."
                disabled={submitted}
                aria-label={`Repons pou kesyon ${index + 1}`}
              ></textarea>

              {submitted && (
                <div className="mt-3 p-3 rounded-xl border" style={{ background: 'rgba(79,70,229,0.15)', borderColor: 'var(--primary)' }}>
                  <p className="font-bold text-sm mb-1" style={{ color: 'var(--success-main)' }}>Repons Kòrèk:</p>
                  <p className="mb-2 whitespace-pre-wrap font-medium" style={{ color: 'var(--text-main)' }}>{q.correctAnswer}</p>
                  <p className="font-bold text-sm mb-1" style={{ color: 'var(--accent-main)' }}>Eksplikasyon:</p>
                  <p className="whitespace-pre-wrap font-medium" style={{ color: 'var(--text-muted)' }}>{q.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {!submitted && (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              className="px-6 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              Soumèt Repons
            </button>
          )}
          {submitted && (
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                onClick={onRegenerateQuiz}
                className="px-6 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, var(--success-main), #059669)' }}
              >
                Re-jenere Egzèsis
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-6 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
              >
                <span>📥</span> Telechaje (PDF/HTML)
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default QuizCard;