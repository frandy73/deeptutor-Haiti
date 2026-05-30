import { GoogleGenAI, GenerateContentResponse, Type, Content, Part } from "@google/genai";
import { PWOF_OU_SYSTEM_INSTRUCTION_BASE, MODULE_INSTRUCTIONS } from '../constants';
import { Language, ModuleType, Quiz, ChatMessage, MessageSender } from '../types';

interface GetGeminiResponseParams {
  prompt: string;
  selectedModule: ModuleType;
  studentLevel: string;
  responseLanguage: Language;
  onChunk: (chunk: string) => void;
  isQuizRequest?: boolean; // New parameter to indicate if a quiz is requested
  chatHistoryContext?: ChatMessage[]; // New parameter for chat history
}

const createGeminiInstance = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Define the response schema for a Quiz
const quizResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'The title of the quiz or exercise.',
    },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: 'A unique identifier for the question.',
          },
          question: {
            type: Type.STRING,
            description: 'The quiz question.',
          },
          correctAnswer: {
            type: Type.STRING,
            description: 'The correct answer to the question.',
          },
          explanation: {
            type: Type.STRING,
            description: 'An explanation for the correct answer.',
          },
        },
        required: ['id', 'question', 'correctAnswer', 'explanation'],
      },
      description: 'An array of quiz questions.',
    },
  },
  required: ['title', 'questions'],
  propertyOrdering: ['title', 'questions'],
};

export async function getGeminiResponse({
  prompt,
  selectedModule,
  studentLevel,
  responseLanguage,
  onChunk,
  isQuizRequest = false,
  chatHistoryContext = [], // Default to empty array
}: GetGeminiResponseParams): Promise<string> {
  const ai = createGeminiInstance();
  if (!ai) {
    throw new Error("Gemini API client not initialized due to missing API_KEY.");
  }

  let systemInstruction = `
${PWOF_OU_SYSTEM_INSTRUCTION_BASE}

Nivo Elèv ak Langaj Sible:
- Nivo Aktyèl Elèv: ${studentLevel}
- Langaj Preferans: ${responseLanguage === Language.KREYOL ? 'Kreyòl' : 'Français'}

${MODULE_INSTRUCTIONS[selectedModule]}
`;

  if (isQuizRequest) {
    systemInstruction += `
OU DWE JENERE YON QUIZ OUBYEN YON EGZÈSIS.
Fòma repons ou an DWE JSON.
JSON la DWE respekte schema sa a:
${JSON.stringify(quizResponseSchema, null, 2)}
JENERE yon quiz ak 3 kesyon sou baz sa ki te di anvan oswa sou sijè elèv la vle aprann la. Chak kesyon dwe genyen yon ID inik, kesyon an, repons kòrèk la, ak yon eksplikasyon detaye.
PA JENERE OKENN TÈKS DEYÒ FÒMA JSON AN.
`;
  }

  // Build the contents array, including chat history
  const contents: Content[] = [];

  // Add previous messages from history, filtering out quiz messages
  for (const message of chatHistoryContext) {
    if (!message.quizData) { // Only include regular text messages in the context
      contents.push({
        role: message.sender === MessageSender.USER ? 'user' : 'model',
        parts: [{ text: message.text }],
      });
    }
  }

  // Add the current user's prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash', // Mid-size multimodal model, stable in 2026
      contents: contents, // Use the constructed contents array
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8, // Adjust for creativity vs. factual accuracy
        topP: 0.95,
        topK: 64,
        responseMimeType: isQuizRequest ? 'application/json' : undefined,
        responseSchema: isQuizRequest ? quizResponseSchema : undefined,
      },
    });

    let fullResponse = '';
    for await (const chunk of responseStream) {
      const text = (chunk as GenerateContentResponse).text;
      if (text) {
        fullResponse += text;
        if (!isQuizRequest) { // Only send chunks for regular text responses
          onChunk(text);
        }
      }
    }
    return fullResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erè nan koneksyon ak Gemini: ${error.message}`);
    }
    throw new Error("Yon erè enkoni rive pandan apèl Gemini API a.");
  }
}