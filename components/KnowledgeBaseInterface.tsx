import React, { useState, useEffect, useCallback } from 'react';
import { KnowledgeFile } from '../types';
import { loadKnowledgeFiles, saveKnowledgeFiles, updateStreakAndXP } from '../services/localStorageService';
import { saveFileText, getFileText, deleteFileText } from '../services/dbService';
import { extractTextFromPDF } from '../services/pdfService';
import { XP_REWARDS } from '../constants';
import { KnowledgeBaseSkeleton } from './SkeletonLoader';
import { notifySuccess, notifyError } from '../services/notificationService';

interface KnowledgeBaseInterfaceProps {
  onUseInChat: (text: string, fileName: string) => void;
  onCompareWithOfficial?: (text: string, fileName: string) => void;
  onStartMastery?: (text: string, fileName: string) => void;
  onMenuClick?: () => void;
}

const KnowledgeBaseInterface: React.FC<KnowledgeBaseInterfaceProps> = ({ onUseInChat, onCompareWithOfficial, onStartMastery, onMenuClick }) => {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<Record<string, { current: number; total: number }>>({});
  const [filesWithText, setFilesWithText] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFiles = async () => {
      const updatedFiles = loadKnowledgeFiles();
      setFiles(updatedFiles);
      const textStatus: Record<string, boolean> = {};
      for (const file of updatedFiles) {
        const text = await getFileText(file.id);
        textStatus[file.id] = !!text;
      }
      setFilesWithText(textStatus);
      setIsLoading(false);
    };
    checkFiles();
  }, []);

  const processFile = useCallback(async (file: File) => {
    const id = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7);
    const newFile: KnowledgeFile = { id, name: file.name, uploadDate: new Date().toISOString(), pageCount: 0 };
    setProcessingId(id);
    const updatedFiles = [...loadKnowledgeFiles(), newFile];
    setFiles(updatedFiles);
    saveKnowledgeFiles(updatedFiles);

    try {
      const result = await extractTextFromPDF(file, (current, total) => {
        setProcessingProgress(prev => ({ ...prev, [id]: { current, total } }));
      });
      await saveFileText(id, result.text);
      setFilesWithText(prev => ({ ...prev, [id]: true }));
      const finalFiles = loadKnowledgeFiles().map(f => f.id === id ? { ...f, pageCount: result.pageCount } : f);
      setFiles(finalFiles);
      saveKnowledgeFiles(finalFiles);
      updateStreakAndXP(XP_REWARDS.PDF_UPLOADED);
      notifySuccess('📄 Dokiman chaje!', `"${file.name}" byen ajoute nan baz konesans ou.`);
    } catch {
      const errFiles = loadKnowledgeFiles().map(f => f.id === id ? { ...f, name: f.name + ' (erè li)' } : f);
      setFiles(errFiles);
      saveKnowledgeFiles(errFiles);
      notifyError('PDF erè', `Pa t kapab li "${file.name}". Eseye yon lòt fichye.`);
    } finally {
      setProcessingId(null);
      setProcessingProgress(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  }, []);

  const handleFileChange = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    Array.from(selectedFiles).filter(f => f.type === 'application/pdf').forEach(f => processFile(f));
  }, [processFile]);

  const handleDelete = useCallback(async (fileId: string) => {
    if (!window.confirm('Efase fichye sa a?')) return;
    await deleteFileText(fileId);
    setFilesWithText(prev => { const next = { ...prev }; delete next[fileId]; return next; });
    const updated = loadKnowledgeFiles().filter(f => f.id !== fileId);
    setFiles(updated);
    saveKnowledgeFiles(updated);
  }, []);

  const handleUseInChat = useCallback(async (file: KnowledgeFile) => {
    const text = await getFileText(file.id);
    if (!text) { alert('Fichye sa a pa gen tèks ekstrè. Eseye retelechaje li.'); return; }
    onUseInChat(text, file.name);
  }, [onUseInChat]);

  const handleCompare = useCallback(async (file: KnowledgeFile) => {
    const text = await getFileText(file.id);
    if (!text) { alert('Fichye sa a pa gen tèks ekstrè. Eseye retelechaje li.'); return; }
    if (onCompareWithOfficial) onCompareWithOfficial(text, file.name);
  }, [onCompareWithOfficial]);

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); };

  if (isLoading) {
    return <KnowledgeBaseSkeleton />;
  }

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
            📚
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Baz Konesans</h2>
            <p className="text-sm font-medium text-white/80 mt-1">Telechaje liv ou yo — AI a ap li yo pou ede ou!</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
        
        {/* Ministry Program Banner */}
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 border-2 shadow-lg group"
          style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'var(--primary)' }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-all duration-500" />
          
          <div className="relative z-10 flex gap-4 sm:gap-6 items-center">
            <div className="text-5xl sm:text-6xl drop-shadow-md shrink-0">🇭🇹</div>
            <div className="flex-1">
              <h4 className="m-0 text-base sm:text-lg font-black uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-main)' }}>
                Liv Ofisyèl MENFP Entegre
              </h4>
              <p className="m-0 text-xs sm:text-sm font-medium leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
                Mwen deja genyen rezime ak pwogram ofisyèl Ministè a (1ère AF rive NS4). AI a ap itilize yo otomatikman si opsyon "Sipò MENFP" a aktif nan konfigirasyon an.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Kourikoulòm 2025
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Ground Truth Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          className={`relative overflow-hidden border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer group
            ${isDragging ? 'scale-[1.02] shadow-xl' : 'hover:scale-[1.01] hover:shadow-lg'}`}
          style={{ 
            borderColor: isDragging ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
            background: isDragging ? 'rgba(79,70,229,0.15)' : 'rgba(22, 29, 51, 0.85)' 
          }}
          onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
          onDragOver={handleDragOver} onDrop={handleDrop}
          onClick={() => document.getElementById('kb-file-input')?.click()}
        >
          {isDragging && <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />}
          <input id="kb-file-input" type="file" multiple accept="application/pdf" className="hidden" onChange={e => handleFileChange(e.target.files)} />
          
          <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4 transition-transform duration-300 shadow-lg
            ${isDragging ? 'bg-indigo-500 text-white scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20'}`}>
            📄
          </div>
          <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-main)' }}>
            {isDragging ? 'Lage PDF ou isit!' : 'Ajoute Lòt Liv oswa Nòt pèsonèl'}
          </h3>
          <p className="text-sm font-medium max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            App la ap li tèks la direkteman nan navigatè — pa bezwen entènèt espesyal pou telechaje yo!
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-black text-lg flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
               Dokiman ou yo 
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {files.length}
              </span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {files.map(file => {
                const isProcessing = processingId === file.id;
                const hasText = filesWithText[file.id];
                
                return (
                  <div key={file.id} className="rounded-2xl p-4 sm:p-5 shadow-sm border transition-all hover:shadow-md group" 
                       style={{ background: 'rgba(22, 29, 51, 0.85)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="flex items-start justify-between gap-4">
                      
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm
                          ${isProcessing ? 'bg-amber-100 dark:bg-amber-900/30 animate-pulse' : 
                            hasText ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                          {isProcessing ? '⏳' : hasText ? '✅' : '⚠️'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="m-0 text-sm font-black truncate" style={{ color: 'var(--text-main)' }} title={file.name}>
                            {file.name}
                          </h4>
                          <p className="m-0 mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                            {isProcessing ? 'Ap ekstrè tèks la...' : hasText ? `${file.pageCount || '?'} paj — Prè pou AI` : 'Pa ka li tèks la'}
                            <span className="mx-1.5 opacity-50">•</span>
                            {new Date(file.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasText && (
                          <div className="flex gap-1.5 flex-col sm:flex-row">
                            <button onClick={() => handleUseInChat(file)}
                              className="px-3 py-2 rounded-xl text-xs font-black text-white shadow-md transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-1.5 gradient-button"
                              title="Kominike ak AI sou dokiman sa a">
                              <span>🤖</span> <span className="hidden sm:inline">Pale</span>
                            </button>
                            {onCompareWithOfficial && (
                              <button onClick={() => handleCompare(file)}
                                className="px-3 py-2 rounded-xl text-xs font-black border-2 transition-all hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 glass-card"
                                style={{ color: 'var(--text-main)' }} title="Konpare ak pwogram MENFP">
                                <span>🇭🇹</span> <span className="hidden sm:inline">Konpare</span>
                              </button>
                            )}
                            {onStartMastery && (
                              <button onClick={() => {
                                getFileText(file.id).then(text => {
                                  if (text) onStartMastery(text, file.name);
                                });
                              }}
                                className="px-3 py-2 rounded-xl text-xs font-black text-white shadow-md transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-1.5"
                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} title="Kòmanse Mèt Leson sou liv sa a">
                                <span>🏆</span> <span className="hidden sm:inline">Mèt Leson</span>
                              </button>
                            )}
                          </div>
                        )}
                        <button onClick={() => handleDelete(file.id)}
                          className="w-8 h-8 sm:w-auto sm:px-2 sm:py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center"
                          title="Efase fichye">
                          🗑️
                        </button>
                      </div>

                    </div>

                    {isProcessing && (
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Travay sou li</span>
                          <span className="text-[10px] font-black text-indigo-500">
                            {(() => {
                              const prog = processingProgress[file.id];
                              return prog ? `${Math.round((prog.current / prog.total) * 100)}%` : 'Eskane...';
                            })()}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
                            style={{
                              width: (() => {
                                const prog = processingProgress[file.id];
                                return prog ? `${(prog.current / prog.total) * 100}%` : '65%';
                              })()
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state bottom space */}
        {files.length === 0 && !processingId && (
          <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm font-medium">Lè w gen liv, y ap parèt isit la.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default KnowledgeBaseInterface;