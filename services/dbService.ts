/**
 * dbService.ts
 * Yon sèvis pou jere IndexedDB nan langaj Kreyòl/Fransè.
 * Sa pèmèt nou sere gwo liv (PDF text) san limit localStorage la.
 */

const DB_NAME = 'DeepTutorAyitiDB';
const STORE_NAME = 'pdf_texts';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event: any) => resolve(event.target.result);
        request.onerror = (event: any) => reject(event.target.error);
    });
};

export const saveFileText = async (id: string, text: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id, text, timestamp: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = (event: any) => reject(event.target.error);
    });
};

export const getFileText = async (id: string): Promise<string> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = (event: any) => {
            resolve(event.target.result ? event.target.result.text : '');
        };
        request.onerror = (event: any) => reject(event.target.error);
    });
};

export const deleteFileText = async (id: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (event: any) => reject(event.target.error);
    });
};
