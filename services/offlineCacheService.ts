/**
 * offlineCacheService.ts
 * Sèvis pou jere cache offline — pou elèv ki pa gen bon entènèt an Ayiti.
 * Itilize IndexedDB pou sere gwo done ki pa ka nan localStorage.
 */

const OFFLINE_DB_NAME = 'PwofOuOfflineDB';
const OFFLINE_DB_VERSION = 1;
const AI_RESPONSES_STORE = 'ai_responses';
const CACHED_QUIZZES_STORE = 'cached_quizzes';

// ── Initialize offline database ──────────────────────────────────────────────
const initOfflineDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      // Store for cached AI responses
      if (!db.objectStoreNames.contains(AI_RESPONSES_STORE)) {
        const store = db.createObjectStore(AI_RESPONSES_STORE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Store for cached quiz data
      if (!db.objectStoreNames.contains(CACHED_QUIZZES_STORE)) {
        db.createObjectStore(CACHED_QUIZZES_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
};

// ── Cache an AI response for offline review ──────────────────────────────────
export const cacheAIResponse = async (
  prompt: string,
  response: string,
  moduleType: string
): Promise<void> => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction([AI_RESPONSES_STORE], 'readwrite');
    const store = tx.objectStore(AI_RESPONSES_STORE);

    // Create a simple hash of the prompt for the ID
    const id = hashString(prompt);

    store.put({
      id,
      prompt,
      response,
      moduleType,
      timestamp: Date.now(),
    });

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Cache silently fails — not critical
  }
};

// ── Get a cached AI response ─────────────────────────────────────────────────
export const getCachedAIResponse = async (prompt: string): Promise<string | null> => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction([AI_RESPONSES_STORE], 'readonly');
    const store = tx.objectStore(AI_RESPONSES_STORE);
    const id = hashString(prompt);

    return new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => {
        resolve(request.result ? request.result.response : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

// ── Cache quiz data ──────────────────────────────────────────────────────────
export const cacheQuizData = async (
  key: string,
  quizData: any
): Promise<void> => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction([CACHED_QUIZZES_STORE], 'readwrite');
    const store = tx.objectStore(CACHED_QUIZZES_STORE);

    store.put({
      id: key,
      data: quizData,
      timestamp: Date.now(),
    });

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    console.warn('Offline cache: pa kapab sere quiz la');
  }
};

// ── Get cached quiz data ─────────────────────────────────────────────────────
export const getCachedQuizData = async (key: string): Promise<any | null> => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction([CACHED_QUIZZES_STORE], 'readonly');
    const store = tx.objectStore(CACHED_QUIZZES_STORE);

    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result ? request.result.data : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

// ── Prefetch all Bac exam data for offline use ───────────────────────────────
export const prefetchBacExamsForOffline = async (): Promise<void> => {
  try {
    // Dynamic import to avoid circular deps
    const { EXAM_DATABASE } = await import('../bacQuizzes');

    for (const level of Object.keys(EXAM_DATABASE)) {
      for (const subject of Object.keys(EXAM_DATABASE[level])) {
        for (const year of Object.keys(EXAM_DATABASE[level][subject])) {
          const key = `bac_${level}_${subject}_${year}`;
          await cacheQuizData(key, EXAM_DATABASE[level][subject][year]);
        }
      }
    }
    console.log('✅ Tout egzamen Bac yo cache pou offline!');
  } catch {
    console.warn('Pa kapab prefetch egzamen Bac yo');
  }
};

// ── Cleanup old cached responses (older than 30 days) ────────────────────────
export const cleanupOldCache = async (): Promise<void> => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction([AI_RESPONSES_STORE], 'readwrite');
    const store = tx.objectStore(AI_RESPONSES_STORE);
    const index = store.index('timestamp');
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const range = IDBKeyRange.upperBound(thirtyDaysAgo);
    const request = index.openCursor(range);

    request.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  } catch {
    // Cleanup silently fails
  }
};

// ── Get offline storage usage stats ──────────────────────────────────────────
export const getOfflineStorageStats = async (): Promise<{
  aiResponses: number;
  quizzes: number;
  estimatedSizeMB: number;
}> => {
  try {
    const db = await initOfflineDB();

    const countStore = (storeName: string): Promise<number> => {
      return new Promise((resolve) => {
        const tx = db.transaction([storeName], 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      });
    };

    const aiResponses = await countStore(AI_RESPONSES_STORE);
    const quizzes = await countStore(CACHED_QUIZZES_STORE);

    // Rough estimate: average AI response ~2KB, quiz ~1KB
    const estimatedSizeMB = ((aiResponses * 2 + quizzes * 1) / 1024);

    return { aiResponses, quizzes, estimatedSizeMB };
  } catch {
    return { aiResponses: 0, quizzes: 0, estimatedSizeMB: 0 };
  }
};

// ── Simple string hash function ──────────────────────────────────────────────
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `cache_${Math.abs(hash).toString(36)}`;
}
