import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Note } from '../types';
import { loadNotes, saveNotes, updateStreakAndXP } from '../services/localStorageService';
import { XP_REWARDS } from '../constants';

interface NotebookInterfaceProps {
  onUseInChat: (text: string, title: string) => void;
  onMenuClick?: () => void;
}

type ViewMode = 'inbox' | 'archive' | 'quick' | 'tags';

const NotebookInterface: React.FC<NotebookInterfaceProps> = ({ onUseInChat, onMenuClick }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [viewMode, setViewMode] = useState<ViewMode>('inbox');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedNotes = loadNotes();
    setNotes(savedNotes);
    if (savedNotes.length > 0) {
      const noteToSelect = selectedNoteId ? savedNotes.find(n => n.id === selectedNoteId) : savedNotes[0];
      if (noteToSelect) {
        setSelectedNoteId(noteToSelect.id);
        setSelectedNote(noteToSelect);
        setTitle(noteToSelect.title);
        setContent(noteToSelect.content);
      }
    }
  }, []);

  const filteredNotes = React.useMemo(() => {
    return notes.filter(n => {
      const inRightFolder = n.folder === viewMode || (!n.folder && viewMode === 'inbox');
      if (!inRightFolder) return false;
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      const contentTags = (n.content.match(/#[a-zA-Z0-9_]+/g) || []).map(t => t.substring(1).toLowerCase());
      return n.title.toLowerCase().includes(searchLower) || 
             n.content.toLowerCase().includes(searchLower) ||
             contentTags.some(t => t.includes(searchLower));
    });
  }, [notes, viewMode, searchQuery]);

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSaveStatus('idle');
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nouvo Nòt',
      content: '',
      lastModified: new Date().toISOString(),
      folder: viewMode === 'tags' ? 'inbox' : viewMode,
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    handleSelectNote(newNote);
  };

  const handleSave = useCallback(() => {
    if (!selectedNoteId) return;
    setSaveStatus('saving');
    try {
      const updatedNotes = notes.map(n =>
        n.id === selectedNoteId
          ? { ...n, title, content, lastModified: new Date().toISOString() }
          : n
      );
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
    }
  }, [selectedNoteId, title, content, notes]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Èske ou sèten ou vle efase nòt sa a?')) return;
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    if (selectedNoteId === id) {
      if (updatedNotes.length > 0) handleSelectNote(updatedNotes[0]);
      else {
        setSelectedNoteId(null);
        setSelectedNote(null);
        setTitle('');
        setContent('');
      }
    }
  };

  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const newFolder = note.folder === 'archive' ? 'inbox' : 'archive';
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, folder: newFolder, lastModified: new Date().toISOString() } : n
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleQuickCapture = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const newFolder = note.folder === 'quick' ? 'inbox' : 'quick';
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, folder: newFolder, lastModified: new Date().toISOString() } : n
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleUseInChat = () => {
    if (content.trim()) onUseInChat(content, title);
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const extractTags = (text: string): string[] => {
    const tagMatches = text.match(/#[a-zA-Z0-9_]+/g) || [];
    return [...new Set(tagMatches.map(t => t.substring(1)))];
  };

  const allTags = [...new Set(notes.flatMap(n => extractTags(n.content)))];

  const renderMathLatex = (latex: string): string => {
    try {
      if (typeof window !== 'undefined' && (window as any).katex) {
        return (window as any).katex.renderToString(latex, { throwOnError: false, displayMode: false });
      }
      return latex;
    } catch { return latex; }
  };

  const renderMathDisplay = (latex: string): string => {
    try {
      if (typeof window !== 'undefined' && (window as any).katex) {
        return (window as any).katex.renderToString(latex, { throwOnError: false, displayMode: true });
      }
      return latex;
    } catch { return latex; }
  };

  const renderMarkdown = (text: string): string => {
    let html = text;
    html = html.replace(/\$\$([^$]+)\$\$/g, (_, math) => `<div class="my-4 p-4 bg-gray-50 rounded-lg overflow-x-auto">${renderMathDisplay(math.trim())}</div>`);
    html = html.replace(/\$([^$\n]+)\$/g, (_, math) => renderMathLatex(math.trim()));
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-3">$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm text-pink-600">$1</code>');
    html = html.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-indigo-500 pl-4 italic opacity-80 my-2">$1</blockquote>');
    html = html.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-500 hover:underline font-medium">$1</a>');
    html = html.replace(/#([a-zA-Z0-9_]+)/g, '<span class="text-indigo-500 font-medium">#$1</span>');
    html = html.replace(/\n/g, '<br/>');
    return html;
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden" style={{ background: 'var(--surface-container-lowest)' }}>
      {/* Sidebar List */}
      <div className={`
        ${selectedNoteId ? 'hidden md:flex' : 'flex'} 
        w-full md:w-80 flex-shrink-0 flex-col z-10 border-r
      `} style={{ background: 'var(--surface)', borderColor: 'rgba(255,255,255,0.1)' }}>
        
        {/* Header (replaces standard header on desktop left side) */}
        <div className="p-4 sm:p-6 pb-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shrink-0 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            {onMenuClick && (
              <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all">
                ☰
              </button>
            )}
            <span className="text-2xl">🗒️</span>
            <h2 className="text-lg font-black tracking-tight">Kaye Nòt</h2>
          </div>
          <button 
            onClick={handleCreateNote} 
            className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur border border-white/20 text-white text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <span className="text-lg">+</span> Kreye Nòt
          </button>
        </div>
        
        {/* View Tabs */}
        <div className="p-3 border-b flex gap-1.5" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {[
            { id: 'inbox', icon: '📥', label: 'Nòt' },
            { id: 'quick', icon: '⚡', label: 'Rapid' },
            { id: 'archive', icon: '📦', label: 'Achiv' },
            { id: 'tags', icon: '🏷️', label: 'Tit' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={`flex-1 p-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                viewMode === tab.id ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400 shadow-inner' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={{ color: viewMode === tab.id ? '' : 'var(--text-muted)' }}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-50" style={{ color: 'var(--text-main)' }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chèche nòt..."
              className="w-full pl-10 pr-3 py-2.5 text-sm font-medium rounded-xl border-2 outline-none transition-all focus:border-indigo-500"
              style={{ background: 'var(--surface-container)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {viewMode === 'tags' && allTags.length > 0 && !searchQuery && (
            <div className="mb-4 p-2">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Filtre pa tit</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button key={tag} onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1 text-xs font-bold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400">
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 opacity-50 mt-10">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {searchQuery ? 'Pa gen nòt pou rechèch sa.' : 'Pa gen nòt nan seksyon sa.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map(note => (
                <div key={note.id} onClick={() => handleSelectNote(note)}
                  className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all group flex justify-between items-start border-2
                    ${selectedNoteId === note.id ? 'bg-indigo-50 border-indigo-500/30 shadow-sm dark:bg-indigo-900/20 dark:border-indigo-500/50' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <div className="min-w-0 pr-2 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      {note.folder === 'quick' && <span className="text-xs">⚡</span>}
                      {note.folder === 'archive' && <span className="text-xs">📦</span>}
                      <p className="font-bold text-sm truncate" style={{ color: selectedNoteId === note.id ? 'var(--primary)' : 'var(--text-main)' }}>{note.title || 'San tit'}</p>
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {note.content.substring(0, 60) || 'Pa gen kontni ankò...'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleQuickCapture(note.id, e)} className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30" title="Rapid">⚡</button>
                    <button onClick={(e) => handleArchive(note.id, e)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="Achiv">📦</button>
                    <button onClick={(e) => handleDelete(note.id, e)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className={`
        ${!selectedNoteId ? 'hidden md:flex' : 'flex'} 
        flex-1 flex-col relative
      `} style={{ background: 'rgba(22, 29, 51, 0.85)' }}>
        {!selectedNoteId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-60">
            <div className="w-32 h-32 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-6xl shadow-inner">
              📝
            </div>
            <h4 className="text-xl font-black mb-2" style={{ color: 'var(--text-main)' }}>Chwazi yon nòt nan lis la</h4>
            <p className="text-sm font-medium max-w-sm" style={{ color: 'var(--text-muted)' }}>Oswa kreye youn nèf pou w kòmanse ekri ide w yo.</p>
          </div>
        ) : (
          <>
            {/* Editor Header */}
            <div className="p-3 sm:p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 glass-card" style={{ borderRadius: 0 }}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button onClick={() => setSelectedNoteId(null)} className="md:hidden p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex-shrink-0">
                  ←
                </button>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tit nòt la..."
                  className="bg-transparent text-xl font-black outline-none flex-1 truncate"
                  style={{ color: 'var(--text-main)' }}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button onClick={() => setShowPreview(!showPreview)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-2
                    ${showPreview ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400 shadow-inner' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                  style={{ color: showPreview ? '' : 'var(--text-main)' }}>
                  {showPreview ? '✏️ Edit' : '👁️ Wè'}
                </button>
                <button onClick={handleExport} className="px-3 py-2 rounded-xl text-xs font-bold border-2 border-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-all hidden sm:block" style={{ color: 'var(--text-main)' }} title="Ekspòte kòm Markdown">
                  📥 Ekspòte
                </button>
                <button onClick={handleUseInChat} className="px-3 py-2 rounded-xl font-black text-xs text-white shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 gradient-button">
                  🤖 <span className="hidden sm:inline">Voye nan AI</span>
                </button>
                <button onClick={handleSave}
                  className={`px-4 py-2 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-95
                    ${saveStatus === 'saved' ? 'bg-emerald-500' : saveStatus === 'error' ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {saveStatus === 'saving' ? <span className="animate-spin text-lg leading-none">⚙️</span> : saveStatus === 'saved' ? '✅' : '💾 Sove'}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative flex">
              {showPreview ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
                  <div className="max-w-3xl mx-auto prose prose-indigo dark:prose-invert" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) || '<p class="opacity-50 italic">Pa gen kontni...</p>' }} />
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSave(); }
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const target = e.target as HTMLTextAreaElement;
                      const start = target.selectionStart;
                      const end = target.selectionEnd;
                      setContent(content.substring(0, start) + '  ' + content.substring(end));
                      setTimeout(() => target.selectionStart = target.selectionEnd = start + 2, 0);
                    }
                  }}
                  className="w-full h-full p-6 sm:p-10 bg-transparent outline-none resize-none leading-relaxed font-mono text-sm custom-scrollbar focus:ring-inset focus:ring-2 focus:ring-indigo-500/10"
                  style={{ color: 'var(--text-main)' }}
                  placeholder="# Kòmanse ekri isit la...&#10;&#10;Ou ka itilize Markdown. Pou sove byen vit, peze Ctrl+S."
                />
              )}
            </div>

            {/* Tags Display Footer */}
            <div className="shrink-0 p-3 px-4 border-t flex flex-wrap items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'var(--surface-container-lowest)' }}>
              <span className="text-[10px] font-black uppercase tracking-widest mr-1" style={{ color: 'var(--text-muted)' }}>Tit yo:</span>
              {extractTags(content).map(tag => (
                <span key={tag} className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400">
                  #{tag}
                </span>
              ))}
              {extractTags(content).length === 0 && (
                <span className="text-xs font-medium italic opacity-60" style={{ color: 'var(--text-muted)' }}>Ekri #tit nan tèks la pou ajoute</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotebookInterface;