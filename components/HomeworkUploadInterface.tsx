import React, { useState, useRef, useCallback } from 'react';
import { ChatMessage, MessageSender, DeepTutorConfig } from '../types';
import { getAIResponse } from '../services/aiService';
import { updateStreakAndXP } from '../services/localStorageService';
import { XP_REWARDS } from '../constants';
import Message from './Message';
import LoadingSpinner from './LoadingSpinner';

interface HomeworkUploadInterfaceProps {
  config: DeepTutorConfig;
  onMenuClick?: () => void;
}

const HomeworkUploadInterface: React.FC<HomeworkUploadInterfaceProps> = ({ config, onMenuClick }) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    Array.from(files).forEach(file => {
      if (!validTypes.includes(file.type)) { setError('Sèlman jpg, png, webp oswa gif aksepte'); return; }
      if (file.size > 10 * 1024 * 1024) { setError('Foto a twò gro (max 10MB)'); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) setUploadedImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const analyzeHomework = useCallback(async () => {
    if (uploadedImages.length === 0) return;
    setIsAnalyzing(true);
    setError(null);

    const userMessage: ChatMessage = { id: Date.now().toString(), sender: MessageSender.USER, text: '📷 Mwen voye foto devwa mwen an. Tanpri eksplike m.' };
    setMessages([userMessage]);

    try {
      const prompt = `📷 FOTO DEVWA: Elèv laVoye ${uploadedImages.length} foto(s) devwa.\n\nTanpri eksplike solisyon an ETAP PA ETAP selon NIVO ${config.studentLevel}. Itilize langaj ki adapte nivo sa a.`;
      const response = await getAIResponse({
        prompt,
        selectedModule: 'Voye Foto Devwa' as any,
        studentLevel: config.studentLevel,
        responseLanguage: config.responseLanguage,
        onChunk: () => {},
        chatHistoryContext: [],
        aiProvider: config.aiProvider,
        ollamaModel: config.ollamaModel,
        selectedSubject: config.selectedSubject,
        imageData: uploadedImages,
      });

      const botMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: MessageSender.BOT, text: response };
      setMessages([userMessage, botMessage]);
      updateStreakAndXP(XP_REWARDS.MESSAGE_SENT);
    } catch {
      setError('ERÈ: Pa t kapab analize foto a. Eseye ankò.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedImages, config]);

  const clearAll = useCallback(() => { setUploadedImages([]); setMessages([]); setError(null); }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--surface-container-lowest)' }}>
      {/* Header */}
      <div className="relative overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {onMenuClick && (
              <button onClick={onMenuClick} className="md:hidden p-2 -ml-1.5 rounded-xl bg-white/15 hover:bg-white/25 transition-all text-white border border-white/10 shrink-0">
                ☰
              </button>
            )}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shrink-0">
              📷
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Voye Foto Devwa</h2>
              <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-widest">
                  Nivo: {config.studentLevel}
                </p>
              </div>
            </div>
          </div>

          {(uploadedImages.length > 0 || messages.length > 0) && (
            <button onClick={clearAll} className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-black transition-all border border-white/10 flex items-center gap-2 shadow-sm">
              <span className="text-sm">✏️</span> <span className="hidden sm:inline uppercase tracking-widest">Nouvo</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pb-8 space-y-6">
        
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-black border-2 flex items-center gap-3 shadow-sm animate-shake" style={{ borderColor: '#fecaca' }}>
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}

        {uploadedImages.length === 0 && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-lg mx-auto mt-4 sm:mt-10">
            <div className="w-32 h-32 mb-6 sm:mb-8 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 border-2 border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-6xl shadow-inner animate-float-medium">
              📸
            </div>
            <h3 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: 'var(--text-main)' }}>Pran yon Foto Devwa Ou</h3>
            <p className="text-sm sm:text-base font-medium mb-8 leading-relaxed max-w-md" style={{ color: 'var(--text-muted)' }}>
              Voye yon foto devwa a la a. Pwof Ou ap analize l, li tèks la oswa ekwasyon yo epi esplike w kòman pou rezoud li.
            </p>
            <button onClick={() => fileInputRef.current?.click()}
              className="px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-black text-base sm:text-lg text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 w-full sm:w-auto"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 10px 25px -5px rgba(79,70,229,0.4)' }}>
              <span className="text-2xl">📁</span> Chwazi Foto a
            </button>
            <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => handleImageSelect(e.target.files)} className="hidden" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Image Preview Area */}
            {uploadedImages.length > 0 && messages.length === 0 && (
              <div className="p-6 sm:p-8 rounded-[2rem] border-2 shadow-xl animate-fade-in text-center relative overflow-hidden" style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-full" />
                
                <h3 className="text-lg font-black mb-6" style={{ color: 'var(--text-main)' }}>Foto w chwazi yo:</h3>
                
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 shadow-md transition-transform group-hover:scale-105" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <img src={img} alt={`Devwa ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <button onClick={() => removeImage(idx)}
                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white font-black text-sm border-2 border-white dark:border-slate-800 shadow-md transition-transform hover:scale-110 flex items-center justify-center">
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  {uploadedImages.length < 4 && (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed flex items-center justify-center text-3xl transition-all hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                      +
                    </button>
                  )}
                </div>

                <button onClick={analyzeHomework} disabled={isAnalyzing}
                  className={`px-8 py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 w-full sm:w-auto mx-auto shadow-lg
                    ${isAnalyzing ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed opacity-70' : 'text-white hover:scale-[1.02] active:scale-95'}`}
                  style={{ background: isAnalyzing ? '' : 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  {isAnalyzing ? (
                    <><span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Ap analize devwa w la...</>
                  ) : (
                    <>🤖 Mande Eksplikasyon pou Devwa a</>
                  )}
                </button>
                <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => handleImageSelect(e.target.files)} className="hidden" />
              </div>
            )}

            {/* Analysis Result */}
            {messages.length > 0 && (
              <div className="space-y-6">
                {messages.map(msg => (
                  <div key={msg.id} className="animate-slide-up"><Message message={msg} /></div>
                ))}
                {isAnalyzing && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="px-5 py-4 rounded-2xl rounded-tl-sm border shadow-md flex items-center gap-3 glass-card">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-sm shrink-0">🤖</div>
                      <LoadingSpinner message="Pwof Ou ap analize foto a pou l ba w solisyon an..." />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkUploadInterface;