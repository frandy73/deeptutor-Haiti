// Backup/Export Service for DeepTutor Ayiti
// Allows users to export and import their data

import { loadProgress, loadChatHistory, loadNotes, loadFlashcardDecks, loadKnowledgeFiles } from './localStorageService';

export interface BackupData {
    version: string;
    exportDate: string;
    progress: unknown;
    chatHistory: unknown[];
    notes: unknown[];
    flashcardDecks: unknown[];
    knowledgeFiles: unknown[];
    config?: unknown;
}

const BACKUP_VERSION = '1.0.0';

// Export all user data as JSON
export const exportAllData = (): string => {
    const data: BackupData = {
        version: BACKUP_VERSION,
        exportDate: new Date().toISOString(),
        progress: loadProgress(),
        chatHistory: loadChatHistory(),
        notes: loadNotes(),
        flashcardDecks: loadFlashcardDecks(),
        knowledgeFiles: loadKnowledgeFiles(),
    };

    return JSON.stringify(data, null, 2);
};

// Download data as a file
export const downloadBackup = (filename: string = 'deeptutor-backup.json'): void => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Import data from a JSON string
export const importData = async (jsonString: string): Promise<{ success: boolean; message: string }> => {
    try {
        const data: BackupData = JSON.parse(jsonString);

        // Validate version
        if (!data.version) {
            return { success: false, message: 'Fichye backup la pa valid' };
        }

        // Import each data type
        if (data.progress) {
            localStorage.setItem('deeptutor_student_progress', JSON.stringify(data.progress));
        }
        if (data.chatHistory) {
            localStorage.setItem('deeptutor_chat_history', JSON.stringify(data.chatHistory));
        }
        if (data.notes) {
            localStorage.setItem('deeptutor_notes', JSON.stringify(data.notes));
        }
        if (data.flashcardDecks) {
            localStorage.setItem('deeptutor_flashcard_decks', JSON.stringify(data.flashcardDecks));
        }
        if (data.knowledgeFiles) {
            localStorage.setItem('deeptutor_knowledge_files', JSON.stringify(data.knowledgeFiles));
        }

        return { success: true, message: 'Done enpòte avèk siksè!' };
    } catch {
        return { success: false, message: 'Erè pandan enpòtasyon: Fichye a pa valid' };
    }
};

// Read file content
export const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erè lekti fichye'));
        reader.readAsText(file);
    });
};

// Export notes as plain text
export const exportNotesAsText = (): string => {
    const notes = loadNotes();
    if (!notes || notes.length === 0) {
        return 'Pa gen nòt pou ekspòte.';
    }

    let text = '# Nòt DeepTutor Ayiti\n\n';
    for (const note of notes) {
        text += `## ${note.title}\n`;
        text += `Dènye modifikasyon: ${new Date(note.lastModified).toLocaleDateString()}\n\n`;
        text += `${note.content}\n\n---\n\n`;
    }

    return text;
};

// Download notes as text file
export const downloadNotesAsText = (): void => {
    const text = exportNotesAsText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'deeptutor-not.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Export chat history as text
export const exportChatHistoryAsText = (): string => {
    const history = loadChatHistory();
    if (!history || history.length === 0) {
        return 'Pa gen istwa chat pou ekspòte.';
    }

    let text = '# Istwa Chat DeepTutor Ayiti\n\n';
    for (const item of history) {
        text += `## ${item.title}\n`;
        text += `Modil: ${item.moduleType} | Dat: ${new Date(item.timestamp).toLocaleString()}\n\n`;
        for (const msg of item.messages) {
            const sender = msg.sender === 'user' ? 'Elèv' : 'DeepTutor';
            text += `**${sender}:** ${msg.text}\n\n`;
        }
        text += '---\n\n';
    }

    return text;
};

// Download chat history as text file
export const downloadChatHistoryAsText = (): void => {
    const text = exportChatHistoryAsText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'deeptutor-chat-history.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Clear all data (with confirmation)
export const clearAllData = (): void => {
    const keys = [
        'deeptutor_student_progress',
        'deeptutor_chat_history',
        'deeptutor_notebook_content',
        'deeptutor_notes',
        'deeptutor_flashcard_decks',
        'deeptutor_knowledge_files',
        'deeptutor_theme',
    ];

    for (const key of keys) {
        localStorage.removeItem(key);
    }
};
