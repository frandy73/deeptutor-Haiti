/// <reference types="vite/client" />
import { GoogleGenAI, GenerateContentResponse, Type, Content } from "@google/genai";
import { PWOF_OU_SYSTEM_INSTRUCTION_BASE, MODULE_INSTRUCTIONS } from '../constants';
import { Language, ModuleType, Quiz, ChatMessage, MessageSender, AIProvider, Subject } from '../types';
import { getOfficialContextForLevel } from './ministryData';

interface GetAIResponseParams {
    prompt: string;
    selectedModule: ModuleType;
    studentLevel: string;
    responseLanguage: Language;
    onChunk: (chunk: string) => void;
    isQuizRequest?: boolean;
    isFlashcardRequest?: boolean;
    isGlossaryRequest?: boolean;
    isMasteryRequest?: boolean;
    chatHistoryContext?: ChatMessage[];
    knowledgeContext?: string; // Extracted PDF text
    officialContextEnabled?: boolean; // NEW: Toggle for ministry data
    aiProvider?: AIProvider;
    ollamaModel?: string;
    ollamaBaseUrl?: string;
    selectedSubject?: Subject;
    imageData?: string[]; // Base64 encoded images for homework analysis
}

const quizResponseSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'The title of the quiz.' },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                },
                required: ['id', 'question', 'correctAnswer', 'explanation'],
            },
        },
    },
    required: ['title', 'questions'],
};

const glossaryResponseSchema = {
    type: Type.OBJECT,
    properties: {
        termFR: { type: Type.STRING },
        termHT: { type: Type.STRING },
        definitionHT: { type: Type.STRING },
        example: { type: Type.STRING },
        formula: { type: Type.STRING },
        category: { type: Type.STRING },
    },
    required: ['termFR', 'termHT', 'definitionHT', 'example'],
};

const flashcardResponseSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        cards: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    front: { type: Type.STRING, description: 'Konsèp oswa Kesyon' },
                    back: { type: Type.STRING, description: 'Eksplikasyon oswa Repons' },
                },
                required: ['id', 'front', 'back'],
            },
        },
    },
    required: ['title', 'cards'],
};

const masteryLessonResponseSchema = {
    type: Type.OBJECT,
    properties: {
        lessonChunk: { type: Type.STRING, description: 'Esplikasyon leson an trè klè, senp, an kreyòl avèk yon analoji kiltirèl/lokal Ayisyen.' },
        question: { type: Type.STRING, description: 'Kesyon chwa miltip pou tcheke konpreyansyon elèv la.' },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '4 opsyon pou kesyon an (egzanp: ["A) ...", "B) ...", ...]).'
        },
        correctAnswer: { type: Type.STRING, description: 'Lèt opsyon ki kòrèk la (sèlman "A", "B", "C", oswa "D").' },
        explanation: { type: Type.STRING, description: 'Eksplikasyon sou poukisa repons sa a se li ki kòrèk ak poukisa lòt yo se pèlen.' },
    },
    required: ['lessonChunk', 'question', 'options', 'correctAnswer', 'explanation'],
};

function buildSystemInstruction(
    selectedModule: ModuleType,
    studentLevel: string,
    responseLanguage: Language,
    isQuizRequest: boolean,
    isFlashcardRequest: boolean,
    isGlossaryRequest: boolean,
    isMasteryRequest: boolean,
    knowledgeContext?: string,
    officialContextEnabled?: boolean,
    selectedSubject?: Subject
): string {
    let instruction = `
${PWOF_OU_SYSTEM_INSTRUCTION_BASE}

Nivo Elèv ak Langaj Sible:
- Nivo Aktyèl Elèv: ${studentLevel}
- Langaj Preferans: ${responseLanguage === Language.KREYOL ? 'Kreyòl' : 'Français'}
${selectedSubject ? `- Sijè Fokal: ${selectedSubject}` : ''}

${MODULE_INSTRUCTIONS[selectedModule]}
`;

    if (officialContextEnabled) {
        const officialContext = getOfficialContextForLevel(studentLevel, selectedSubject);
        if (officialContext) {
            instruction += `\n${officialContext}\n`;
        }
    }

    if (knowledgeContext) {
        instruction += `
\n--- KONTNI BAZ KONESANS ELÈV LA ---
Elèv la telechaje yon dokiman. Itilize kontni sa a pou reponn kesyon li:
${knowledgeContext.substring(0, 12000)}
--- FIN KONTNI ---\n`;
    }

    if (isQuizRequest) {
        instruction += `
OU DWE JENERE YON QUIZ OUBYEN YON EGZÈSIS.
Fòma repons ou an DWE JSON.
PA JENERE OKENN TÈKS DEYÒ FÒMA JSON AN.
JENERE yon quiz ak 4 kesyon sou baz kontni konvèsasyon an.
`;
    }

    if (isFlashcardRequest) {
        instruction += `
OU DWE JENERE 8 FLASHCARDS.
Fòma repons ou an DWE JSON ak schema sa a: { title, cards: [{id, front, back}] }
Front = Konsèp/Kesyon. Back = Eksplikasyon kout.
PA JENERE OKENN TÈKS DEYÒ FÒMA JSON AN.
`;
    }

    if (isGlossaryRequest) {
        instruction += `
OU DWE JENERE YON SÈL KAT DIKSYONÈ POU TÈM NAN.
Fòma repons ou an DWE JSON e ki genyen: termFR (mo fransè a), termHT (mo kreyòl la), definitionHT (esplikasyon trè klè), example (yon bon egzanp kreyòl/ayisyen), ak formula (fòmil si aplike, sinon ""). category (egz: "Fizik", "Biyoloji").
PA JENERE OKENN TÈKS DEYÒ FÒMA JSON AN.
`;
    }

    if (isMasteryRequest) {
        instruction += `
OU DWE JENERE YON LESON AK YON KESYON CHWA MILTIP.
Fòma repons ou an DWE JSON ki koresponn ak schema a: { lessonChunk, question, options: ["A) ...", "B) ...", "C) ...", "D) ..."], correctAnswer: "A"|"B"|"C"|"D", explanation }
PA JENERE OKENN TÈKS DEYÒ FÒMA JSON AN.
`;
    }

    return instruction;
}

// ---- GEMINI ----
async function callGemini(params: GetAIResponseParams): Promise<string> {
    const apiKey =
        import.meta.env.VITE_GEMINI_API_KEY ||
        import.meta.env.GEMINI_API_KEY ||
        (typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY || process.env?.GEMINI_API_KEY : '');

    if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY pa defini. Ajoute li nan fichye .env.local ou a, epi relonje serveur a (npm run dev).');
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = buildSystemInstruction(
        params.selectedModule, params.studentLevel, params.responseLanguage,
        params.isQuizRequest || false, params.isFlashcardRequest || false, params.isGlossaryRequest || false,
        params.isMasteryRequest || false,
        params.knowledgeContext,
        params.officialContextEnabled,
        params.selectedSubject
    );

const contents: Content[] = [];
    for (const msg of (params.chatHistoryContext || [])) {
        if (!msg.quizData) {
            contents.push({ role: msg.sender === MessageSender.USER ? 'user' : 'model', parts: [{ text: msg.text }] });
        }
    }
    
    // Handle image upload for homework analysis
    if (params.imageData && params.imageData.length > 0) {
        const imageParts = params.imageData.map(img => {
            const base64Data = img.includes(',') ? img.split(',')[1] : img;
            return { inlineData: { data: base64Data, mimeType: 'image/jpeg' } };
        });
        contents.push({ role: 'user', parts: [{ text: params.prompt }, ...imageParts] as any });
    } else {
        contents.push({ role: 'user', parts: [{ text: params.prompt }] });
    }

    const isStructured = params.isQuizRequest || params.isFlashcardRequest || params.isGlossaryRequest || params.isMasteryRequest;
    let schema = undefined;
    if (params.isFlashcardRequest) schema = flashcardResponseSchema;
    else if (params.isQuizRequest) schema = quizResponseSchema;
    else if (params.isGlossaryRequest) schema = glossaryResponseSchema;
    else if (params.isMasteryRequest) schema = masteryLessonResponseSchema;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-3.5-flash',
            contents,
            config: {
                systemInstruction,
                temperature: 0.8,
                responseMimeType: isStructured ? 'application/json' : undefined,
                responseSchema: isStructured ? schema : undefined,
            },
        });

        let fullResponse = '';
        for await (const chunk of responseStream) {
            const text = (chunk as GenerateContentResponse).text;
            if (text) {
                fullResponse += text;
                if (!isStructured) params.onChunk(text);
            }
        }
        return fullResponse;
    } catch (e) {
        throw e;
    }
}

// ---- OLLAMA ----
async function callOllama(params: GetAIResponseParams): Promise<string> {
    const baseUrl = params.ollamaBaseUrl || 'http://localhost:11434';
    const model = params.ollamaModel || 'llama3';

    const systemInstruction = buildSystemInstruction(
        params.selectedModule, params.studentLevel, params.responseLanguage,
        params.isQuizRequest || false, params.isFlashcardRequest || false, params.isGlossaryRequest || false,
        params.isMasteryRequest || false,
        params.knowledgeContext,
        params.officialContextEnabled,
        params.selectedSubject
    );

    const messages = [{ role: 'system', content: systemInstruction }];
    for (const msg of (params.chatHistoryContext || [])) {
        if (!msg.quizData) {
            messages.push({ role: msg.sender === MessageSender.USER ? 'user' : 'assistant', content: msg.text });
        }
    }
    messages.push({ role: 'user', content: params.prompt });

    const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!response.ok || !response.body) {
        throw new Error(`Ollama error: ${response.status} — Asire Ollama ap kouri sou ${baseUrl}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    const isStructured = params.isQuizRequest || params.isFlashcardRequest;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n').filter(Boolean);
        for (const line of lines) {
            try {
                const data = JSON.parse(line);
                const token = data?.message?.content || '';
                if (token) {
                    fullResponse += token;
                    if (!isStructured) params.onChunk(token);
                }
            } catch { /* ignore malformed chunks */ }
        }
    }
    return fullResponse;
}

// ---- MAIN EXPORT ----
export async function getAIResponse(params: GetAIResponseParams): Promise<string> {
    if (params.aiProvider === AIProvider.OLLAMA) {
        return callOllama(params);
    }
    return callGemini(params);
}

// Keep old name as alias for backward compat
export const getGeminiResponse = getAIResponse;
