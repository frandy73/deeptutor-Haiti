import { ChatHistoryItem, KnowledgeFile, StudentProgress, FlashCardDeck, Note, GlossaryTerm } from '../types';
import {
  LOCAL_STORAGE_NOTEBOOK_KEY,
  LOCAL_STORAGE_KNOWLEDGE_FILES_KEY,
  LOCAL_STORAGE_CHAT_HISTORY_KEY,
  LOCAL_STORAGE_PROGRESS_KEY,
  LOCAL_STORAGE_FLASHCARD_DECKS_KEY,
  LOCAL_STORAGE_GLOSSARY_KEY,
  LOCAL_STORAGE_NOTES_KEY,
  LOCAL_STORAGE_ACTIVE_CHAT_ID_KEY,
} from '../constants';

// ---- Safe JSON Parse ----
const safeJsonParse = <T>(data: string | null, fallback: T): T => {
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
};

// ---- Safe LocalStorage ----
const safeLocalStorage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// ---- Chat History ----
export const loadChatHistory = (): ChatHistoryItem[] => {
  return safeJsonParse(safeLocalStorage.get(LOCAL_STORAGE_CHAT_HISTORY_KEY), []);
};

export const saveChatHistory = (history: ChatHistoryItem[]): void => {
  safeLocalStorage.set(LOCAL_STORAGE_CHAT_HISTORY_KEY, JSON.stringify(history));
};

export const removeChatHistoryItem = (id: string): void => {
  const history = loadChatHistory().filter(item => item.id !== id);
  saveChatHistory(history);
};

// ---- Notebook ----
export const loadNotes = (): Note[] => {
  return safeJsonParse(safeLocalStorage.get(LOCAL_STORAGE_NOTES_KEY), []);
};

export const saveNotes = (notes: Note[]): void => {
  safeLocalStorage.set(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(notes));
};

export const loadNotebookContent = (): string => {
  return safeLocalStorage.get(LOCAL_STORAGE_NOTEBOOK_KEY) || '';
};

export const saveNotebookContent = (content: string): void => {
  safeLocalStorage.set(LOCAL_STORAGE_NOTEBOOK_KEY, content);
};

// ---- Knowledge Files ----
export const loadKnowledgeFiles = (): KnowledgeFile[] => {
  return safeJsonParse(safeLocalStorage.get(LOCAL_STORAGE_KNOWLEDGE_FILES_KEY), []);
};

export const saveKnowledgeFiles = (files: KnowledgeFile[]): void => {
  safeLocalStorage.set(LOCAL_STORAGE_KNOWLEDGE_FILES_KEY, JSON.stringify(files));
};

// ---- Student Progress ----
import { BADGE_DEFINITIONS, XP_REWARDS } from '../constants';
import { notifyAchievement, notifyInfo, notifySuccess } from './notificationService';

const DEFAULT_PROGRESS: StudentProgress = {
  xp: 0,
  streak: 0,
  lastActiveDate: '',
  totalQuizzes: 0,
  totalMessages: 0,
  badges: [],
  subjectScores: {},
  masteredTopics: [],
  masteryXp: 0,
};

export const loadProgress = (): StudentProgress => {
  const parsed = safeJsonParse<Partial<StudentProgress>>(safeLocalStorage.get(LOCAL_STORAGE_PROGRESS_KEY), {});
  return {
    ...DEFAULT_PROGRESS,
    ...parsed,
    masteredTopics: parsed.masteredTopics || [],
    masteryXp: parsed.masteryXp || 0,
    badges: parsed.badges || [],
  };
};

export const saveProgress = (progress: StudentProgress): void => {
  safeLocalStorage.set(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(progress));
};

const checkAndAwardBadges = (progress: StudentProgress): StudentProgress => {
  const newlyEarned: string[] = [...progress.badges];
  let badgeAdded = false;
  let newBadgeName = '';

  for (const badge of BADGE_DEFINITIONS) {
    if (!newlyEarned.includes(badge.id)) {
      try {
        if (badge.requirement(progress)) {
          newlyEarned.push(badge.id);
          badgeAdded = true;
          newBadgeName = badge.name;
        }
      } catch {
        // Badge requirement check failed silently
      }
    }
  }

  if (badgeAdded) {
    return { ...progress, badges: newlyEarned };
  }
  return progress;
};

export const updateStreakAndXP = (xpToAdd: number): StudentProgress => {
  const progress = loadProgress();
  const today = new Date().toISOString().split('T')[0];
  const lastDate = progress.lastActiveDate;

  let newStreak = progress.streak;
  const wasNewDay = lastDate !== today;
  if (wasNewDay) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    newStreak = lastDate === yesterdayStr ? progress.streak + 1 : 1;
  }

  let updated: StudentProgress = {
    ...progress,
    xp: progress.xp + xpToAdd,
    streak: newStreak,
    lastActiveDate: today,
  };

  const prevBadges = updated.badges.length;
  updated = checkAndAwardBadges(updated);
  const newBadges = updated.badges.slice(prevBadges);

  // Notify for new badges
  for (const badgeId of newBadges) {
    const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (badgeDef) {
      notifyAchievement(badgeDef.name, badgeDef.description);
    }
  }

  // Notify for streak milestones
  if (wasNewDay && newStreak === 3) {
    notifyAchievement('🔥 Streak 3 Jou!', 'Ou etidye 3 jou konsekitif! Kontinye konsa!');
  } else if (wasNewDay && newStreak === 7) {
    notifyAchievement('💪 Streak 1 Semèn!', 'Yon semèn konplè etid! Ou se yon chanpyon!');
  } else if (wasNewDay && newStreak === 30) {
    notifyAchievement('👑 Streak 1 Mwa!', '30 jou etid! Ou envinsib!');
  }

  // Notify for XP
  if (newBadges.length === 0) {
    notifyInfo('⭐ +' + xpToAdd + ' XP', 'Kontinye etidye pou genyen plis XP!');
  }

  saveProgress(updated);
  return updated;
};

export const markTopicAsMastered = (topicId: string): StudentProgress => {
  const progress = loadProgress();
  const alreadyMastered = progress.masteredTopics?.includes(topicId);

  let updated: StudentProgress = { ...progress };

  if (!alreadyMastered) {
    const mastered = [...(progress.masteredTopics || []), topicId];
    updated = {
      ...progress,
      masteredTopics: mastered,
      xp: progress.xp + XP_REWARDS.MASTERY_QUEST_COMPLETED,
      masteryXp: (progress.masteryXp || 0) + XP_REWARDS.MASTERY_QUEST_COMPLETED,
    };
  }

  updated = checkAndAwardBadges(updated);
  saveProgress(updated);
  return updated;
};

// ---- Flashcard Decks ----
export const loadFlashcardDecks = (): FlashCardDeck[] => {
  return safeJsonParse(safeLocalStorage.get(LOCAL_STORAGE_FLASHCARD_DECKS_KEY), []);
};

export const saveFlashcardDecks = (decks: FlashCardDeck[]): void => {
  safeLocalStorage.set(LOCAL_STORAGE_FLASHCARD_DECKS_KEY, JSON.stringify(decks));
};

// ---- Glossary ----
export const loadGlossaryTerms = (): GlossaryTerm[] => {
  return safeJsonParse(safeLocalStorage.get(LOCAL_STORAGE_GLOSSARY_KEY), []);
};

export const saveGlossaryTerms = (terms: GlossaryTerm[]): void => {
  safeLocalStorage.set(LOCAL_STORAGE_GLOSSARY_KEY, JSON.stringify(terms));
};

// ---- Active Session ----
export const getActiveChatId = (): string | null => {
  return localStorage.getItem(LOCAL_STORAGE_ACTIVE_CHAT_ID_KEY);
};

export const setActiveChatId = (id: string | null): void => {
  if (id) {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_CHAT_ID_KEY, id);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_ACTIVE_CHAT_ID_KEY);
  }
};