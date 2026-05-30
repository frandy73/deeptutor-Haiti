export enum ModuleType {
  DASHBOARD = 'Tablodbo / Akèy',
  GUIDED_LEARNING = 'Gid Aprantisaj',
  SMART_SOLVER = 'Rezoud Devoir',
  QUESTION_GENERATOR = 'Jeneratè Kesyon',
  CO_WRITER = 'Asistan Redaktè',
  DEEP_RESEARCH = 'Rechèch Pwofon',
  FLASHCARDS = 'Kat memwa (Flashcards)',
  KNOWLEDGE_BASE = 'Dokiman / Liv',
  GLOSSARY = 'Glosè Syantifik',
  NOTEBOOK = 'Kaye Nòt',
  BAC_EXAMS = 'Egzamen Leta',
  DEVOIR_PHOTO = 'Voye Foto Devwa',
  PREMIUM = 'Premium / Abònman',
  MASTER_LESSON = 'Mèt Leson 🏆',
}

export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export enum AIProvider {
  GEMINI = 'gemini',
  OLLAMA = 'ollama',
}

export interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  isStreaming?: boolean;
  quizData?: Quiz;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  uploadDate: string;
  extractedText?: string; // NEW: actual extracted text from PDF
  pageCount?: number;
}

export enum Language {
  KREYOL = 'Kreyòl',
  FRANCAIS = 'Français',
}

export enum Subject {
  KREYOL = 'Kreyòl',
  FRANCAIS = 'Français',
  MATHEMATIQUES = 'Matematik',
  PHYSIQUE = 'Fizik',
  CHIMIE = 'Chimi',
  SCIENCES_SOCIALES = 'Syans Sosyal',
  HISTOIRE = 'Istwa',
  GEOGRAPHIE = 'Jeyografi',
  PHILOSOPHIE = 'Filozofi',
  ANGLAIS = 'Angled',
  BIOLOGIE = 'Biyoloji',
  SVT = 'Syans VIVO',
}

export interface DeepTutorConfig {
  studentLevel: string;
  responseLanguage: Language;
  aiProvider: AIProvider;
  ollamaModel: string;
  selectedSubject?: Subject;
  officialContextEnabled?: boolean; // NEW: Toggle for using ministry data
}

export interface ChatHistoryItem {
  id: string;
  moduleType: ModuleType;
  timestamp: string;
  messages: ChatMessage[];
  title: string;
}

// ---- NEW: Progress System ----
export interface StudentProgress {
  xp: number;
  streak: number;
  lastActiveDate: string;  // ISO string
  totalQuizzes: number;
  totalMessages: number;
  badges: string[];        // badge IDs earned
  subjectScores: { [subject: string]: number }; // xp per subject area
  masteredTopics?: string[]; // list of topic IDs/names mastered
  masteryXp?: number; // total xp earned from mastery quests
}

// ---- NEW: Flashcards ----
export interface FlashCard {
  id: string;
  front: string;  // Question / Konsèp
  back: string;   // Repons / Deskripsyon
  known: boolean;
}

export interface FlashCardDeck {
  id: string;
  title: string;
  cards: FlashCard[];
  createdDate: string;
  sourceFileId?: string; // optional link to a KnowledgeFile
}

// ---- Badge definitions ----
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (p: StudentProgress) => boolean;
}

// ---- NEW: Notebook ----
export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  folder?: string;
  tags?: string[];
}

// ---- NEW: Glossary ----
export interface GlossaryTerm {
  id: string;
  termFR: string;
  termHT: string;
  definitionHT: string;
  example: string;
  formula?: string;
  category?: string;
  savedDate: string;
}