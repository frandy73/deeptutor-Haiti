import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import SplashScreen from './components/SplashScreen';
import LoginInterface from './components/LoginInterface';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import NetworkStatusManager from './components/NetworkStatusManager';
import ModuleSkeleton from './components/ModuleSkeleton';
import ToastContainer, { ToastData } from './components/Toast';

const ChatInterface = lazy(() => import('./components/ChatInterface'));
const KnowledgeBaseInterface = lazy(() => import('./components/KnowledgeBaseInterface'));
const FlashcardsInterface = lazy(() => import('./components/FlashcardsInterface'));
const DashboardInterface = lazy(() => import('./components/DashboardInterface'));
const NotebookInterface = lazy(() => import('./components/NotebookInterface'));
const BacExamsInterface = lazy(() => import('./components/BacExamsInterface'));
const GlossaryInterface = lazy(() => import('./components/GlossaryInterface'));
const PremiumInterface = lazy(() => import('./components/PremiumInterface'));
const HomeworkUploadInterface = lazy(() => import('./components/HomeworkUploadInterface'));
const MasteryInterface = lazy(() => import('./components/MasteryInterface'));
const ProfileInterface = lazy(() => import('./components/ProfileInterface'));
import { prefetchBacExamsForOffline, cleanupOldCache } from './services/offlineCacheService';
import { showUnseenNotifications } from './services/updateService';
import { onNotification, notifySuccess } from './services/notificationService';
import { useKeyboardShortcuts, ShortcutsHelpModal } from './hooks/useKeyboardShortcuts';
import { setSyncUid, pushProgressToFirebase, pullProgressFromFirebase } from './services/syncService';
import { enqueueMessage, processQueue, getQueueLength } from './services/offlineQueueService';
import {
  ChatMessage,
  MessageSender,
  ModuleType,
  DeepTutorConfig,
  Language,
  AIProvider,
  ChatHistoryItem,
  GlossaryTerm
} from './types';
import {
  INITIAL_PWOF_OU_CONFIG,
  XP_REWARDS
} from './constants';
import { getAIResponse } from './services/aiService';
import { initFirebase, onAuthChange, logoutUser, getUserProfile, checkAndIncrementMessageLimit, updateUserProfile, UserProfile } from './services/firebaseService';
import {
  loadChatHistory,
  saveChatHistory,
  updateStreakAndXP,
  getActiveChatId,
  setActiveChatId
} from './services/localStorageService';

const App: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [config, setConfig] = useState<DeepTutorConfig>(INITIAL_PWOF_OU_CONFIG);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('Pwof Ou_theme');
    return saved ? saved === 'dark' : true;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [knowledgeContext, setKnowledgeContext] = useState<{ text: string; fileName: string } | null>(null);
  const isOffline = !navigator.onLine;
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedMasteryPDFText, setSelectedMasteryPDFText] = useState<string | undefined>(undefined);
  const [selectedMasteryPDFName, setSelectedMasteryPDFName] = useState<string | undefined>(undefined);
  const [showSplash, setShowSplash] = useState(true);
  const [previousInteractionId, setPreviousInteractionId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const unsub = onNotification((toast) => {
      setToasts(prev => [...prev, toast]);
    });
    return unsub;
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Prefetch Bac exams for offline use & clean old cached data
  useEffect(() => {
    prefetchBacExamsForOffline();
    cleanupOldCache();

    const handleOnline = async () => {
      const count = await getQueueLength();
      if (count === 0) return;
      notifySuccess('📨 ' + count + ' mesaj ap trete...', 'Rezo a retounen, map voye mesaj ou yo.');
      const result = await processQueue(
        (current, total) => {},
        (text, response) => {
          const now = Date.now();
          const userMsg: ChatMessage = { id: now.toString(), sender: MessageSender.USER, text };
          const botMsg: ChatMessage = { id: (now + 1).toString(), sender: MessageSender.BOT, text: response };
          const chat = { id: 'q_' + now.toString(), moduleType: ModuleType.GUIDED_LEARNING, timestamp: new Date().toISOString(), messages: [userMsg, botMsg], title: text.slice(0, 30) };
          const history = loadChatHistory();
          saveChatHistory([chat, ...history]);
        },
      );
      if (result.processed > 0) {
        notifySuccess('✅ ' + result.processed + ' mesaj voye!', result.failed > 0 ? result.failed + ' pa t ka voye.' : 'Tout mesaj yo te resevwa repons.');
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  useEffect(() => {
    const history = loadChatHistory();
    setChatHistory(history);

    // Restore active session
    const savedActiveId = getActiveChatId();
    if (savedActiveId) {
      const activeChat = history.find(h => h.id === savedActiveId);
      if (activeChat) {
        setMessages(activeChat.messages);
        setSelectedModule(activeChat.moduleType);
        setActiveChatIdState(savedActiveId);
      }
    }

    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('Pwof Ou_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  useEffect(() => {
    const setupFirebase = async () => {
      await initFirebase();
      
      const unsubscribe = await onAuthChange(async (user) => {
        if (user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          const hour = new Date().getHours();
          const greeting = hour < 12 ? 'Bonjou' : hour < 17 ? 'Bonswa' : 'Bòn nwi';
          notifySuccess(`👋 ${greeting}!`, 'Pwof Ou pare pou ede w aprann jodi a!');
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setUserProfile(null);
        }
      });

      return unsubscribe;
    };

    const unsubscribePromise = setupFirebase();
    
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  const handleLoginSuccess = async (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
    setSyncUid(user.uid);
    pullProgressFromFirebase();
    setTimeout(() => showUnseenNotifications(), 1500);
  };

  const handlePaymentSuccess = async () => {
    if (!currentUser) return;
    await updateUserProfile(currentUser.uid, { isPremium: true });
    const refreshed = await getUserProfile(currentUser.uid);
    setUserProfile(refreshed);
    notifySuccess('💎 Premium Aktive!', 'Ou gen tout aksè kounye a!');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setSyncUid(null);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUserProfile(null);
    } catch {
      // Logout error handled silently
    }
  };

  // Hook order fix: Hooks must be defined before early returns.

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Show user message immediately for instant feedback
    const userMessageId = Date.now().toString();
    const userMessage: ChatMessage = { id: userMessageId, sender: MessageSender.USER, text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Check message limit for free users
    if (currentUser && userProfile) {
      const allowed = await checkAndIncrementMessageLimit(currentUser.uid, userProfile.isPremium);
      if (!allowed) {
        setSelectedModule(ModuleType.PREMIUM);
        return;
      }
    }

    setIsLoading(true);

    // If offline, queue the message
    if (!navigator.onLine) {
      await enqueueMessage(text, selectedModule, config, knowledgeContext?.text);
      const queueLen = await getQueueLength();
      notifySuccess('📨 Mesaj an ke!', queueLen + ' mesaj ap tann rezo a.');
      const queuedBotMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: MessageSender.BOT,
        text: '📨 Mesaj ou an ke. Lè entènèt la retounen, m ap reponn ou otomatikman!',
      };
      const offlineMessages = [...newMessages, queuedBotMsg];
      setMessages(offlineMessages);
      saveCurrentChat(offlineMessages);
      setIsLoading(false);
      return;
    }

    const botMsgId = (Date.now() + 1).toString();
    const placeholderBot: ChatMessage = { id: botMsgId, sender: MessageSender.BOT, text: '' };
    setMessages(prev => [...prev, placeholderBot]);

    try {
      let streamedText = '';
      const response = await getAIResponse({
        prompt: text,
        selectedModule,
        studentLevel: config.studentLevel,
        responseLanguage: config.responseLanguage,
        onChunk: (chunk) => {
          streamedText += chunk;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: streamedText } : m));
        },
        chatHistoryContext: newMessages,
        previousInteractionId: previousInteractionId || undefined,
        onInteractionId: setPreviousInteractionId,
        knowledgeContext: knowledgeContext?.text,
        officialContextEnabled: config.officialContextEnabled,
        aiProvider: config.aiProvider,
        ollamaModel: config.ollamaModel,
        selectedSubject: config.selectedSubject
      });

      const finalMessages = [...newMessages, { id: botMsgId, sender: MessageSender.BOT, text: response }];
      setMessages(finalMessages);
      updateStreakAndXP(XP_REWARDS.MESSAGE_SENT);
      pushProgressToFirebase();
      saveCurrentChat(finalMessages);

    } catch (error: any) {
      const errMsg = error?.message || '';
      setMessages([...newMessages, {
        id: botMsgId,
        sender: MessageSender.BOT,
        text: errMsg.includes('API') || errMsg.includes('modèl')
          ? 'Mwen regrèt, sèvè AI a pa reponn kounye a. Tcheke API a epi eseye ankò.'
          : "Mwen regrèt, mwen gen yon ti pwoblèm teknik. Tanpri eseye ankò!",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentChat = useCallback((updatedMessages: ChatMessage[]) => {
    const chatId = activeChatId || Date.now().toString();
    if (!activeChatId) {
      setActiveChatIdState(chatId);
      setActiveChatId(chatId);
    }

    const firstUserMsg = updatedMessages.find(m => m.sender === MessageSender.USER);
    const title = firstUserMsg ? firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '') : 'Nouvo Konvèsasyon';

    const historyItem: ChatHistoryItem = {
      id: chatId,
      moduleType: selectedModule,
      timestamp: new Date().toISOString(),
      messages: updatedMessages,
      title: title,
    };

    setChatHistory(prev => {
      const existingIndex = prev.findIndex(h => h.id === chatId);
      let updatedHistory;
      if (existingIndex > -1) {
        updatedHistory = [...prev];
        updatedHistory[existingIndex] = historyItem;
      } else {
        updatedHistory = [historyItem, ...prev];
      }
      saveChatHistory(updatedHistory);
      return updatedHistory;
    });
  }, [activeChatId, selectedModule]);

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const topic = messages.length > 0 ? messages[messages.length - 1].text : "Egzèsis jeneral";
      const response = await getAIResponse({
        prompt: `JENERE YON EGZÈSIS PWOFE SYONÈL sou sijè sa a: ${topic}. Mete pèlen (traps) ladan l pou teste konpreyansyon elèv la.`,
        selectedModule,
        studentLevel: config.studentLevel,
        responseLanguage: config.responseLanguage,
        onChunk: () => {},
        isQuizRequest: true,
        chatHistoryContext: messages,
        knowledgeContext: knowledgeContext?.text,
        officialContextEnabled: config.officialContextEnabled,
        aiProvider: config.aiProvider,
        ollamaModel: config.ollamaModel,
        selectedSubject: config.selectedSubject
      });

      const quizData = JSON.parse(response);
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: MessageSender.BOT,
        text: "Men yon ti egzèsis pou ou:",
        quizData,
      };
      const finalMessages = [...messages, botMessage];
      setMessages(finalMessages);
      saveCurrentChat(finalMessages);
    } catch {
      setMessages([{
        id: Date.now().toString(),
        sender: MessageSender.BOT,
        text: "Mwen pa t kapab jenere quiz la. Tanpri eseye ankò!",
      }]);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateFlashcards = async (topic: string): Promise<string> => {
    return await getAIResponse({
      prompt: `Jenere flashcards pou: ${topic}`,
      selectedModule: ModuleType.FLASHCARDS,
      studentLevel: config.studentLevel,
      responseLanguage: config.responseLanguage,
      onChunk: () => {},
      isFlashcardRequest: true,
      officialContextEnabled: config.officialContextEnabled,
      aiProvider: config.aiProvider,
      ollamaModel: config.ollamaModel,
      selectedSubject: config.selectedSubject
    });
  };

  const handleSearchGlossary = async (term: string): Promise<GlossaryTerm | null> => {
    try {
      const response = await getAIResponse({
        prompt: `Esplike tèm sa: ${term}`,
        selectedModule: ModuleType.GLOSSARY,
        studentLevel: config.studentLevel,
        responseLanguage: config.responseLanguage,
        onChunk: () => {},
        isGlossaryRequest: true,
        officialContextEnabled: config.officialContextEnabled,
        aiProvider: config.aiProvider,
        ollamaModel: config.ollamaModel,
      });
      return JSON.parse(response) as GlossaryTerm;
    } catch {
      return null;
    }
  };

  const handleClearMessages = () => {
    setMessages([]);
    setKnowledgeContext(null);
    setActiveChatIdState(null);
    setActiveChatId(null);
    setPreviousInteractionId(null);
  };

  const handleConfigChange = (newConfig: Partial<DeepTutorConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleLoadChatHistory = (id: string) => {
    const item = chatHistory.find(h => h.id === id);
    if (item) {
      setMessages(item.messages);
      setSelectedModule(item.moduleType);
      setActiveChatIdState(id);
      setActiveChatId(id);
      setIsSidebarOpen(false);
      setPreviousInteractionId(null);
    }
  };

  const handleDeleteChatHistory = (id: string) => {
    const updated = chatHistory.filter(h => h.id !== id);
    setChatHistory(updated);
    saveChatHistory(updated);
  };

  const handleUseKBInChat = useCallback((text: string, fileName: string) => {
    setKnowledgeContext({ text, fileName });
    setMessages([{
      id: Date.now() + '-kb',
      sender: MessageSender.BOT,
      text: `📚 Mwen chaje **"${fileName}"** — Poze mwen nenpòt kesyon sou liv sa a!`,
    }]);
    setSelectedModule(ModuleType.GUIDED_LEARNING);
  }, []);

  const handleCompareWithOfficial = useCallback(async (text: string, fileName: string) => {
    setKnowledgeContext({ text, fileName });
    setSelectedModule(ModuleType.GUIDED_LEARNING);
    
    const prompt = `Tanpri konpare kontni dokiman sa a (**${fileName}**) ak sa pwogram ofisyèl MENFP a mande pou nivo mwen an. Kisa k manke? Kisa ki byen kouvri?`;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: MessageSender.USER,
      text: prompt,
    };

    const newMessages = [userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await getAIResponse({
        prompt,
        selectedModule: ModuleType.GUIDED_LEARNING,
        studentLevel: config.studentLevel,
        responseLanguage: config.responseLanguage,
        onChunk: () => {},
        chatHistoryContext: [],
        knowledgeContext: text,
        officialContextEnabled: true,
        aiProvider: config.aiProvider,
        ollamaModel: config.ollamaModel,
        selectedSubject: config.selectedSubject
      });

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: MessageSender.BOT,
        text: response,
      };

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      updateStreakAndXP(XP_REWARDS.MESSAGE_SENT);
      pushProgressToFirebase();
      
      // We don't save immediately here to avoid dependency cycle with saveCurrentChat, 
      // but it will be saved naturally on next interaction or we can force a save.
      // Doing a simple manual save:
      const chatId = activeChatId || Date.now().toString();
      setActiveChatIdState(chatId);
      setActiveChatId(chatId);
      
      const historyItem: ChatHistoryItem = {
        id: chatId,
        moduleType: ModuleType.GUIDED_LEARNING,
        timestamp: new Date().toISOString(),
        messages: finalMessages,
        title: prompt.slice(0, 30) + '...',
      };
      
      setChatHistory(prev => {
        const updatedHistory = [historyItem, ...prev.filter(h => h.id !== chatId)];
        saveChatHistory(updatedHistory);
        return updatedHistory;
      });

    } catch (error: any) {
      const errMsg = error?.message || '';
      setMessages([...newMessages, {
        id: (Date.now() + 1).toString(),
        sender: MessageSender.BOT,
        text: errMsg.includes('API') || errMsg.includes('modèl')
          ? 'Mwen regrèt, sèvè AI a pa reponn. Tcheke API a epi eseye ankò.'
          : "Mwen regrèt, mwen gen yon ti pwoblèm teknik. Tanpri eseye ankò!",
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [config, activeChatId]);

  const handleUseNoteInChat = useCallback((text: string, title: string) => {
    setKnowledgeContext({ text, fileName: `Nòt: ${title}` });
    setMessages([{
      id: Date.now() + '-note',
      sender: MessageSender.BOT,
      text: `📝 Mwen chaje nòt ou a: **"${title}"**. Mwen prè pou n pale sou sa ou ekri la a!`,
    }]);
    setSelectedModule(ModuleType.GUIDED_LEARNING);
  }, []);

  const handleStartBacExam = (level: string, subject: string, year: string, topic?: string) => {
    setSelectedModule(ModuleType.BAC_EXAMS);
    const topicText = topic ? ` sou espas **${topic}**` : '';
    setMessages([{
      id: Date.now().toString(),
      sender: MessageSender.BOT,
      text: `👋 Bonjou! Mwen se korijè espesyalis MENFP ou an pou nivo **${level}**. Nou pral travay sou **${subject}** fòma ane **${year}**${topicText}. \n\nKisa ou ta renmen nou fè? 📝 \n1. Ban m yon simulasyon egzamen.\n2. Eksplike m gwo tèm ki te tonbe.\n3. Poze m yon kesyon difisil pou m wè nivo m.\n\n*Montre m chwa ou pou w wè kijan m ka demontre kote pèlen yo kache!*`,
    }]);
  };

  const handleGenerateBacQuiz = async (level: string, subject: string, year: string) => {
    setSelectedModule(ModuleType.BAC_EXAMS);

    const { getQuizFromDatabase } = await import('./bacQuizzes');
    const quizData = getQuizFromDatabase(level, subject, year);
    if (quizData) {
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: MessageSender.BOT,
        text: `📍 Men egzamen reyal oswa modèl **${subject} (${year})** nan nivo **${level}** la. Prepare w pou evite pèlen MENFP yo!`,
        quizData: quizData,
      };
      setMessages([botMessage]);
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      const response = await getAIResponse({
        prompt: `OU SE YON KOREKTÈ MENFP. Jenere yon EGZAMEN LETA MODÈL pou nivo ${level}, ane ${year}, matyè ${subject}. Kesyon yo dwe serye e pwofesyonèl. Pou chaque kesyon, "explanation" an DWE montre KOTE PÈLEN NAN KESYON AN YE (Identifie le piège/distracteur). Fòma JSON.`,
        selectedModule: ModuleType.BAC_EXAMS,
        studentLevel: level,
        responseLanguage: config.responseLanguage,
        onChunk: () => {},
        isQuizRequest: true,
        chatHistoryContext: [],
        officialContextEnabled: config.officialContextEnabled,
        aiProvider: config.aiProvider,
        ollamaModel: config.ollamaModel,
        selectedSubject: config.selectedSubject
      });

      const quizData = JSON.parse(response);
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: MessageSender.BOT,
        text: `📝 Quiz Bac ${year} - ${subject}`,
        quizData,
      };
      const finalMessages = [botMessage];
      setMessages(finalMessages);
      saveCurrentChat(finalMessages);
    } catch {
      setMessages([{
        id: Date.now().toString(),
        sender: MessageSender.BOT,
        text: "Mwen pa t kapab jenere quiz la. Tanpri eseye ankò!",
      }]);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectModule = useCallback((module: ModuleType) => {
    // All modules are free for everyone now
    if (selectedModule !== module) {
      setSelectedModule(module);
      if (module !== ModuleType.GUIDED_LEARNING) {
        setMessages([]);
      }
      if (module !== ModuleType.MASTER_LESSON) {
        setSelectedMasteryPDFText(undefined);
        setSelectedMasteryPDFName(undefined);
      }
    }
    setIsSidebarOpen(false);
  }, [selectedModule, userProfile]);

  const { showHelp, setShowHelp } = useKeyboardShortcuts([
    { key: 'k', ctrl: true, description: 'Chèche / Poze kesyon', action: () => {
      window.dispatchEvent(new CustomEvent('focus-chat-input'));
    }},
    { key: 'n', ctrl: true, description: 'Nouvo konvèsasyon', action: () => {
      handleClearMessages();
      setIsSidebarOpen(false);
      if (selectedModule === ModuleType.DASHBOARD) setSelectedModule(ModuleType.GUIDED_LEARNING);
      notifySuccess('✍️ Nouvo chat!', 'Kòmanse yon nouvo konvèsasyon.');
    }},
    { key: 'd', ctrl: true, description: 'Ale nan Tablodbo', action: () => handleSelectModule(ModuleType.DASHBOARD) },
    { key: 'b', ctrl: true, description: 'Ale nan Egzamen Leta', action: () => handleSelectModule(ModuleType.BAC_EXAMS) },
    { key: 'f', ctrl: true, description: 'Ale nan Flashcards', action: () => handleSelectModule(ModuleType.FLASHCARDS) },
    { key: ',', ctrl: true, description: 'Ouvri konfigirasyon', action: () => {
      setIsSidebarOpen(true);
    }},
    { key: 't', ctrl: true, description: 'Chanje mode (nwa/klè)', action: () => {
      toggleTheme();
    }},
  ]);

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginInterface onLoginSuccess={handleLoginSuccess} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--surface-container-lowest)',
        position: 'relative',
      }}
    >
      {/* Mobile backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="mobile-backdrop"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
            WebkitBackdropFilter: 'blur(4px)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar — always visible on desktop (≥768px), drawer on mobile */}
      <div
        className={`sidebar-wrapper${isSidebarOpen ? ' sidebar-open' : ''}`}
        style={{
          width: '320px',
          height: '100%',
          flexShrink: 0,
          zIndex: 50,
        }}
      >
        <Sidebar
          selectedModule={selectedModule}
          onSelectModule={handleSelectModule}
          config={config}
          onConfigChange={handleConfigChange}
          chatHistory={chatHistory}
          onLoadChatHistory={handleLoadChatHistory}
          onDeleteChatHistory={handleDeleteChatHistory}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onClose={() => setIsSidebarOpen(false)}
          isPremium={userProfile?.isPremium || false}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          minWidth: 0,
        }}
      >
        {/* Network Status Banner */}
        <NetworkStatusManager />

        <Suspense fallback={<ModuleSkeleton />}>
        <div key={selectedModule} className="relative flex-1 flex flex-col overflow-hidden page-enter">
        {selectedModule === ModuleType.DASHBOARD ? (
          <DashboardInterface chatHistory={chatHistory} onMenuClick={() => setIsSidebarOpen(true)} onSelectModule={handleSelectModule} />
        ) : selectedModule === ModuleType.NOTEBOOK ? (
          <NotebookInterface onUseInChat={handleUseNoteInChat} onMenuClick={() => setIsSidebarOpen(true)} />
        ) : selectedModule === ModuleType.KNOWLEDGE_BASE ? (
          <KnowledgeBaseInterface 
            onUseInChat={handleUseKBInChat} 
            onCompareWithOfficial={handleCompareWithOfficial} 
            onStartMastery={(text, name) => {
              setSelectedMasteryPDFText(text);
              setSelectedMasteryPDFName(name);
              setSelectedModule(ModuleType.MASTER_LESSON);
            }}
            onMenuClick={() => setIsSidebarOpen(true)} 
          />
        ) : selectedModule === ModuleType.MASTER_LESSON ? (
          <MasteryInterface
            onMenuClick={() => setIsSidebarOpen(true)}
            selectedPDFText={selectedMasteryPDFText}
            selectedPDFName={selectedMasteryPDFName}
            studentLevel={config.studentLevel}
            responseLanguage={config.responseLanguage}
          />
        ) : selectedModule === ModuleType.FLASHCARDS ? (
          <FlashcardsInterface onGenerateFromAI={handleGenerateFlashcards} onMenuClick={() => setIsSidebarOpen(true)} />
        ) : selectedModule === ModuleType.BAC_EXAMS && messages.length === 0 ? (
          <BacExamsInterface
            onStartExam={handleStartBacExam}
            onGenerateQuiz={handleGenerateBacQuiz}
            onMenuClick={() => setIsSidebarOpen(true)}
            isOffline={isOffline}
            studentLevel={config.studentLevel}
            responseLanguage={config.responseLanguage}
            aiProvider={config.aiProvider}
            ollamaModel={config.ollamaModel}
          />
        ) : selectedModule === ModuleType.GLOSSARY ? (
          <GlossaryInterface 
            onSearchTerm={handleSearchGlossary}
            onMenuClick={() => setIsSidebarOpen(true)}
            isOffline={isOffline}
          />
) : selectedModule === ModuleType.PREMIUM ? (
          <PremiumInterface 
            onMenuClick={() => setIsSidebarOpen(true)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        ) : selectedModule === ModuleType.PROFILE ? (
          <ProfileInterface
            userProfile={userProfile}
            currentUser={currentUser}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onSelectModule={handleSelectModule}
            onLogout={handleLogout}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
        ) : selectedModule === ModuleType.DEVOIR_PHOTO ? (
          <HomeworkUploadInterface 
            config={config}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
        ) : (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isGeneratingQuiz={isGeneratingQuiz}
            selectedModuleName={selectedModule}
            onClearMessages={handleClearMessages}
            onGenerateQuiz={handleGenerateQuiz}
            knowledgeFileName={knowledgeContext?.fileName}
            onMenuClick={() => setIsSidebarOpen(true)}
            isOffline={isOffline}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onLookupWord={handleSearchGlossary}
          />
        )}
        </div>
        </Suspense>
      </main>
    </div>
    <ToastContainer toasts={toasts} onRemove={removeToast} />
    <ShortcutsHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    <PWAInstallPrompt />
    </ErrorBoundary>
  );
};

export default App;
