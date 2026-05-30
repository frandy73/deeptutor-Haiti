// Text-to-Speech Service for DeepTutor Ayiti
// Uses the Web Speech API

export interface TTSOptions {
    lang: string;
    rate?: number;
    pitch?: number;
    volume?: number;
}

const DEFAULT_OPTIONS: TTSOptions = {
    lang: 'ht-HT',
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
};

// Haitian Creole-specific patterns: "ap", "mwen", "ou", "li", "nou", "yo", "sa", "pou", "ki", "nan", etc.
const CREOLE_PATTERNS = /\b(ap|mwen|ou|li|nou|yo|sa|pou|ki|nan|gen|pa|se|te|sou|avèk|jak|kreyòl|ayiti|pwof|bonjou|bonswa|mèsi|tanpri|kesyon|repons|egzèsis|etidyan|aprann|lekòl|matyè|nivo|ane)\b/i;
// French patterns
const FRENCH_PATTERNS = /\b(je|tu|il|elle|nous|vous|ils|elles|suis|es|est|sommes|êtes|sont|ai|as|a|avons|avez|ont|être|avoir|faire|dire|aller|savoir|pouvoir|vouloir|devoir|falloir|merci|bonjour|bonsoir|monsieur|madame|s'il vous plaît|au revoir)\b/i;
// Characters unique to Haitian Creole
const CREOLE_CHARS = /[èéêëàâùûüôöîïçñ]/i;

export const detectLanguage = (text: string): string => {
    
    const words = text.split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return 'ht-HT';

    let creoleScore = 0;
    let frenchScore = 0;

    
    for (const word of words) {
        if (CREOLE_PATTERNS.test(word)) creoleScore += 2;
        if (FRENCH_PATTERNS.test(word)) frenchScore += 2;
        if (CREOLE_CHARS.test(word)) creoleScore += 1;
        if (word.match(/[éèêëàâùûüôöîïç]/i)) frenchScore += 1;
        
        if (/tion|ment|eur|ique|able|ence|ance|esse|ette|elle/i.test(word)) frenchScore += 1;
        if (word.endsWith('m')) creoleScore += 0.5;
    }

    // Check for Kreyòl-specific sentence starters
    if (/^(mwen|ou|li|nou|yo|se|sa|gen|pa|ap|pou|ki|nan)\b/i.test(text.trim())) creoleScore += 3;
    if (/^(je|tu|il|elle|nous|vous|ils|ce|c'est|il y a)\b/i.test(text.trim())) frenchScore += 3;

    return creoleScore >= frenchScore ? 'ht-HT' : 'fr-FR';
};

export const getTTSLangCode = (language: string): string => {
    switch (language) {
        case 'Kreyòl':
            return 'ht-HT';
        case 'Français':
            return 'fr-FR';
        default:
            return 'ht-HT';
    }
};

export const isTTSSupported = (): boolean => {
    return 'speechSynthesis' in window;
};

const findBestVoice = (langCode: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const langPrefix = langCode.split('-')[0];

    // Prefer Google voices (best quality)
    const googleVoice = voices.find(v =>
        v.lang.startsWith(langPrefix) && v.name.toLowerCase().includes('google')
    );
    if (googleVoice) return googleVoice;

    // Then any voice matching the language
    const matchingVoice = voices.find(v => v.lang.startsWith(langPrefix));
    if (matchingVoice) return matchingVoice;

    // Fallback to first English voice
    const fallback = voices.find(v => v.lang.startsWith('en'));
    return fallback || voices[0];
};

export const speakText = (
    text: string,
    options: Partial<TTSOptions> = {}
): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!isTTSSupported()) {
            reject(new Error('Text-to-Speech is not supported in this browser'));
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

        // Auto-detect language if not explicitly provided
        const lang = mergedOptions.lang || detectLanguage(text);
        utterance.lang = lang;
        utterance.rate = mergedOptions.rate || 0.9;
        utterance.pitch = mergedOptions.pitch || 1.0;
        utterance.volume = mergedOptions.volume || 1.0;

        // Find best matching voice
        const bestVoice = findBestVoice(lang);
        if (bestVoice) {
            utterance.voice = bestVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve(); // Don't reject - just stop silently

        window.speechSynthesis.speak(utterance);
    });
};

export const stopSpeaking = (): void => {
    if (isTTSSupported()) {
        window.speechSynthesis.cancel();
    }
};

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
    if (!isTTSSupported()) {
        return [];
    }
    return window.speechSynthesis.getVoices();
};

export const isSpeaking = (): boolean => {
    return isTTSSupported() && window.speechSynthesis.speaking;
};
