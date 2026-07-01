import { ModuleType, DeepTutorConfig } from '../types';
import { getAIResponse } from './aiService';

interface QueuedMessage {
  id: string;
  text: string;
  selectedModule: ModuleType;
  studentLevel: string;
  responseLanguage: string;
  aiProvider: string;
  ollamaModel: string;
  selectedSubject?: string;
  knowledgeContextText?: string;
  officialContextEnabled?: boolean;
  createdAt: string;
}

const DB_NAME = 'PwofOuOfflineDB';
const STORE_NAME = 'message_queue';
const DB_VERSION = 2;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      // Shared stores with offlineCacheService — create if not present
      if (!db.objectStoreNames.contains('ai_responses')) {
        const store = db.createObjectStore('ai_responses', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains('cached_quizzes')) {
        db.createObjectStore('cached_quizzes', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getQueueLength = async (): Promise<number> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const count = await new Promise<number>((res, rej) => {
      const req = store.count();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
    db.close();
    return count;
  } catch {
    return 0;
  }
};

export const enqueueMessage = async (
  text: string,
  selectedModule: ModuleType,
  config: DeepTutorConfig,
  knowledgeContextText?: string,
): Promise<void> => {
  const msg: QueuedMessage = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    text,
    selectedModule,
    studentLevel: config.studentLevel,
    responseLanguage: config.responseLanguage,
    aiProvider: config.aiProvider,
    ollamaModel: config.ollamaModel,
    selectedSubject: config.selectedSubject,
    knowledgeContextText,
    officialContextEnabled: config.officialContextEnabled,
    createdAt: new Date().toISOString(),
  };

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.add(msg);
  tx.commit();
  db.close();
};

export const processQueue = async (
  onProgress?: (current: number, total: number) => void,
  onMessageDone?: (text: string, response: string) => void,
): Promise<{ processed: number; failed: number }> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const all = await new Promise<QueuedMessage[]>((res, rej) => {
    const req = store.getAll();
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });

  let processed = 0;
  let failed = 0;

  for (let i = 0; i < all.length; i++) {
    const msg = all[i];
    if (onProgress) onProgress(i + 1, all.length);

    try {
      const response = await getAIResponse({
        prompt: msg.text,
        selectedModule: msg.selectedModule as ModuleType,
        studentLevel: msg.studentLevel,
        responseLanguage: msg.responseLanguage as any,
        onChunk: () => {},
        aiProvider: msg.aiProvider as any,
        ollamaModel: msg.ollamaModel,
        selectedSubject: msg.selectedSubject as any,
        officialContextEnabled: msg.officialContextEnabled,
        knowledgeContext: msg.knowledgeContextText,
      });

      if (onMessageDone) onMessageDone(msg.text, response);
      processed++;
    } catch {
      failed++;
      continue;
    }

    store.delete(msg.id);
  }

  db.close();
  return { processed, failed };
};

export const clearQueue = async (): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.clear();
  tx.commit();
  db.close();
};
