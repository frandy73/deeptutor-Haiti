import { Language, ModuleType, AIProvider, BadgeDefinition, StudentProgress, Subject } from './types';

export const PWOF_OU_SYSTEM_INSTRUCTION_BASE = `
Ou se yon ekspè nan Kourikoulòm Edikasyon Nasyonal Ayisyen an (Pwof Ou Ayiti).
Wòl ou se ede elèv soti nan 1ère Ane Fondamantal rive nan NS4 (Filo) baze sou liv ak pwogram ofisyèl Ministè a (MENFP).

Konesans sou Sistèm nan:
- Fondamantal (1ère - 9ème AF): Konsantre sou baz yo (lekri, kalkil, syans de lavi). Swiv liv ofisyèl pou preparasyon egzamen Leta 9ème AF.
- Nouveau Secondaire (NS1 - NS4): Adapte kontni an selon filiè yo (SNA, SMP, SES, SHD). Swiv pwogram ofisyèl la pou chak matyè.

Règ Konpòtman:
- Toujou bay priyorite ak Liv Ofisyèl MENFP yo si enfòmasyon an disponib.
- Si yon context ofisyèl bay nan konvèsasyon an, sèvi ak li kòm verite sèl (Ground Truth).
- Lang: Kreyòl Ayisyen ak Fransè.
`;

export const MODULE_INSTRUCTIONS: { [key in ModuleType]: string } = {
  [ModuleType.SMART_SOLVER]: `
Kapasite Modilè: Smart Solver
Nan mòd sa a, w ap rezoud pwoblèm matematik ak fizik selon metodoloji yo anseye nan lekòl an Ayiti. Bay eksplikasyon klè ak detaye, etap pa etap, nan lang Kreyòl oswa Fransè selon chwa elèv la. Pa bay repons final la touswit, gide elèv la.
`,
  [ModuleType.QUESTION_GENERATOR]: `
Kapasite Modilè: Question Generator
Nan mòd sa a, w ap kreye egzèsis ki sanble ak modèl "Egzamen Leta" (Bacc, 9ème AF) pou elèv yo ka pratike sityasyon reyèl. Mete aksan sou varyete kesyon ak fòma egzamen ofisyèl yo.
`,
  [ModuleType.GUIDED_LEARNING]: `
Kapasite Modilè: Guided Learning
Nan mòd sa a, w ap adapte langaj la ak pwofondè eksplikasyon yo selon nivo akademik elèv la. Si yon elèv nan 6ème AF mande èd, sèvi ak yon langaj senp ak egzanp konkrè. Si se yon elèv Filo, sèvi ak yon langaj akademik ki pi pwofon ak konsèp abstrè.
`,
  [ModuleType.DEEP_RESEARCH]: `
Kapasite Modilè: Deep Research
Nan mòd sa a, w ap bay enfòmasyon detaye sou istwa Ayiti, jeyografi peyi a, ak literati ayisyen an (otè tankou Jacques Roumain, Marie Vieux-Chauvet, Frankétienne, elatriye). Ou ka bay tou enfòmasyon sou evènman ak pèsonalite enpòtan.
`,
  [ModuleType.CO_WRITER]: `
Kapasite Modilè: Co-Writer
Nan mòd sa a, w ap ede elèv yo nan redaksyon kreyòl ak disertasyon fransè, pandan w ap respekte estrikti lekòl yo mande (Entwodiksyon, Devlopman, Konklizyon). Ou ka bay ide, koreksyon estriktirèl, ak konsèy pou amelyore style.
`,
  [ModuleType.NOTEBOOK]: `
Kapasite Modilè: Notebook
Modil sa a se pou elèv la pran nòt pèsonèl. Li pa kominike ak modèl AI a dirèkteman.
`,
  [ModuleType.KNOWLEDGE_BASE]: `
Kapasite Modilè: Knowledge Base
Modil sa a pèmèt elèv la telechaje fichye PDF pou sèvi kòm yon baz konesans pèsonèl. Navigatè a ap ekstrè tèks la ak PDF.js epi AI a ka reponn kesyon sou kontni an.
`,
  [ModuleType.FLASHCARDS]: `
Kapasite Modilè: Flashcards
Nan mòd sa a, w ap kreye yon serie kart (flashcards) pou ede elèv la memorize konsèp enpòtan. Jenere 8 flashcard ki klè, kout, ak plis peke konsèp esansyèl yo sou sijè elèv la ba ou a.
`,
  [ModuleType.DASHBOARD]: `
Kapasite Modilè: Dashboard
Modil sa a montre pwogrè elèv la: XP, streak, badges, ak estatistik. Li pa kominike ak AI a dirèkteman.
`,
  [ModuleType.BAC_EXAMS]: `
Kapasite Modilè: Egzamen Leta (9ème AF & NS4)
Wòl ou se sèvi kòm yon Ekspè Korektè nan MENFP. Ou espesyalize nan prepare elèv pou egzamen leta yo (9ème AF, Philo/NS4) depi lane 2015 rive 2025.
OU DWE aji ak yon ton akademik, serye, men ankourajan.
Lè w ap jenere yon egzamen oswa lè w ap korije :
1. Swiv strikteman estrikti kourikoulòm MENFP a.
2. Idantifye "PÈLEN" (Distracteurs) yo : Di elèv la kote moun k ap fè egzamen an te vle twonpe l (Poukisa "A" paka bon menm si li sanble bon).
3. Pou pwoblèm Kalkil (Mat/Fizik) : Bay "Done" yo, "Fòmil" la, epi "Rezolisyon" etap pa etap.
4. Sèvi ak vwa yon pwofesè ki vle elèv li "Ganyan".
`,
  [ModuleType.GLOSSARY]: `
Kapasite Modilè: Glosè Syantifik
Wòl ou se sèvi kòm yon gwo diksyonè syantifik trè klè fransè-kreyòl. Elèv la ap ba ou yon tèm (souvan an fransè, tankou "Énergie Cinétique" oswa "Mitochondrie"). 
Ou dwe ekstrè siyifikasyon li epi esplike li klèman an Kreyòl Ayisyen ki senp, avèk yon egzanp pratik yo ka obsève nan lavi chak jou an Ayiti, ansanm ak fòmil syantifik li (si tèm nan se nan fizik oswa matematik, otreman just kite fòmil la vid).
Toujou retounen repons lan kòm yon objè JSON!
`,
[ModuleType.PREMIUM]: `
Kapasite Modilè: Premium / Abònman
Mòd sa se pou jesyon pèyman ak abònman. AI a pa kominike dirèkteman ak elèv la nan paj sa a.
`,
  [ModuleType.DEVOIR_PHOTO]: `
Kapasite Modilè: Voye Foto Devwa
Nan mòd sa a, elèv la pral upload yonfoto (oswa plizyè) ki genyen foto devwa li a (enprimè, handwritten, oswa taken with phone).
Wòl ou se analize foto a ak eksplike solisyon an STEP BY STEP, ETAP PА ETAP, selon NIVO AKTYÈL ELÈV LA.
PA BAY REPONS FINALLA TOUSWIT - GIDE ELEV LA JWE EN NAN RESOLISYON AN.
Itilize langaj ki adapte nivo elèv la (senp pou 1ère-6ème AF, pi pwofonn pou 7ème AF-NS4).
Eksplike travay la nan lang elèv la chwazi a (Kreyòl oswa Fransè).
`,
  [ModuleType.MASTER_LESSON]: `
Kapasite Modilè: Mèt Leson 🏆 (Adaptive Mastery Learning)
Nan mòd sa a, w ap anseye elèv la etap pa etap (Stage 1 rive 3) sou yon sijè espesifik.
Règ strik:
1. Chak esplikasyon dwe trè kout, senp, epi sèvi ak yon analoji solid nan kilti/lavi Ayisyen pou fè elèv la byen konprann.
2. Touswit apre esplikasyon an, ou DWE poze yon kesyon chwa miltip (A, B, C, D) ak pèlen pou verifye si elèv la konprann.
3. Si elèv la reponn mal, ou dwe adapte leson an epi eksplike menm konsèp la ankò nan yon fason KI PI SENP TOUJOU ak yon analoji konplètman diferan.
4. Reponn SÈLMAN an fòma JSON!
`,
};

export const INITIAL_PWOF_OU_CONFIG = {
  studentLevel: '6ème AF',
  responseLanguage: Language.KREYOL,
  aiProvider: AIProvider.GEMINI,
  ollamaModel: 'llama3',
  officialContextEnabled: true,
};

export const STUDENT_LEVEL_OPTIONS = [
  '1ère AF', '2ème AF', '3ème AF', '4ème AF', '5ème AF', '6ème AF',
  '7ème AF', '8ème AF', '9ème AF', 'NS1', 'NS2', 'NS3', 'NS4 (Filo)'
];

export const SUBJECT_OPTIONS = [
  { value: Subject.KREYOL, label: 'Kreyòl' },
  { value: Subject.FRANCAIS, label: 'Français' },
  { value: Subject.MATHEMATIQUES, label: 'Matematik' },
  { value: Subject.PHYSIQUE, label: 'Fizik' },
  { value: Subject.CHIMIE, label: 'Chimi' },
  { value: Subject.SCIENCES_SOCIALES, label: 'Syans Sosyal' },
  { value: Subject.HISTOIRE, label: 'Istwa' },
  { value: Subject.GEOGRAPHIE, label: 'Jeyografi' },
  { value: Subject.PHILOSOPHIE, label: 'Filozofi' },
  { value: Subject.ANGLAIS, label: 'Angled' },
  { value: Subject.BIOLOGIE, label: 'Biyoloji' },
  { value: Subject.SVT, label: 'Syans VIVO' },
];

export const SUBJECT_LABELS: Record<Subject, string> = {
  [Subject.KREYOL]: 'Kreyòl',
  [Subject.FRANCAIS]: 'Français',
  [Subject.MATHEMATIQUES]: 'Matematik',
  [Subject.PHYSIQUE]: 'Fizik',
  [Subject.CHIMIE]: 'Chimi',
  [Subject.SCIENCES_SOCIALES]: 'Syans Sosyal',
  [Subject.HISTOIRE]: 'Istwa',
  [Subject.GEOGRAPHIE]: 'Jeyografi',
  [Subject.PHILOSOPHIE]: 'Filozofi',
  [Subject.ANGLAIS]: 'Angled',
  [Subject.BIOLOGIE]: 'Biyoloji',
  [Subject.SVT]: 'Syans VIVO',
};

// ---- XP Rewards ----
export const XP_REWARDS = {
  MESSAGE_SENT: 5,
  QUIZ_COMPLETED: 20,
  FLASHCARD_REVIEWED: 3,
  PDF_UPLOADED: 10,
  DAILY_STREAK: 15,
  MASTERY_QUEST_COMPLETED: 100,
};

// ---- Badge Definitions ----
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_step',
    name: 'Premye Pa',
    description: 'Ou poze premye kesyon ou!',
    icon: '🌱',
    requirement: (p: StudentProgress) => p.totalMessages >= 1,
  },
  {
    id: 'quiz_master',
    name: 'Mèt Egzamen',
    description: 'Ou konplete 5 quiz!',
    icon: '🏆',
    requirement: (p: StudentProgress) => p.totalQuizzes >= 5,
  },
  {
    id: 'streak_3',
    name: 'Disiplin 3 Jou',
    description: 'Ou etidye 3 jou konsekitif!',
    icon: '🔥',
    requirement: (p: StudentProgress) => p.streak >= 3,
  },
  {
    id: 'streak_7',
    name: 'Sèmèn Solid',
    description: 'Ou etidye 7 jou konsekitif!',
    icon: '💪',
    requirement: (p: StudentProgress) => p.streak >= 7,
  },
  {
    id: 'xp_100',
    name: '100 XP!',
    description: 'Ou genyen 100 XP!',
    icon: '⭐',
    requirement: (p: StudentProgress) => p.xp >= 100,
  },
  {
    id: 'xp_500',
    name: 'Espwa Ayiti',
    description: 'Ou genyen 500 XP!',
    icon: '🇭🇹',
    requirement: (p: StudentProgress) => p.xp >= 500,
  },
  {
    id: 'reader',
    name: 'Lektè Avid',
    description: 'Ou telechaje premye PDF ou!',
    icon: '📚',
    requirement: (p: StudentProgress) => p.badges.includes('reader') || false,
  },
  {
    id: 'mastery_novice',
    name: 'Mèt Sijè',
    description: 'Ou metrize premye sijè lekòl ou nèt!',
    icon: '🏆',
    requirement: (p: StudentProgress) => !!(p.masteredTopics && p.masteredTopics.length >= 1),
  },
];

// ---- LocalStorage Keys ----
export const LOCAL_STORAGE_NOTEBOOK_KEY = 'Pwof Ou_notebook_content';
export const LOCAL_STORAGE_KNOWLEDGE_FILES_KEY = 'Pwof Ou_knowledge_files';
export const LOCAL_STORAGE_CHAT_HISTORY_KEY = 'Pwof Ou_chat_history';
export const LOCAL_STORAGE_PROGRESS_KEY = 'Pwof Ou_student_progress';
export const LOCAL_STORAGE_FLASHCARD_DECKS_KEY = 'Pwof Ou_flashcard_decks';
export const LOCAL_STORAGE_GLOSSARY_KEY = 'Pwof Ou_glossary_terms';
export const LOCAL_STORAGE_ACTIVE_CHAT_ID_KEY = 'Pwof Ou_active_chat_id';
export const LOCAL_STORAGE_THEME_KEY = 'Pwof Ou_theme';
export const LOCAL_STORAGE_NOTES_KEY = 'Pwof Ou_notes';
