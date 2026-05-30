// Worksheet Generator Service for DeepTutor Ayiti
// Generates printable worksheets from AI

import { getAIResponse } from './aiService';
import { ModuleType, Language } from '../types';

export interface WorksheetExercise {
    id: string;
    question: string;
    answer?: string;
}

export interface Worksheet {
    title: string;
    subject: string;
    level: string;
    instructions: string;
    exercises: WorksheetExercise[];
}

// Generate a printable worksheet
export const generateWorksheet = async (
    topic: string,
    subject: string,
    level: string,
    language: Language,
    aiProvider?: string,
    ollamaModel?: string
): Promise<Worksheet> => {
    const prompt = `
Jenere yon fèy egzèsis printable pou elèv.

Sijè: ${subject}
Tèm: ${topic}
Nivo: ${level}

Fòma a dwe JSON:
{
  "title": "Tit fèy egzèsis la",
  "subject": "${subject}",
  "level": "${level}",
  "instructions": "Enstriksyon pou elèv la",
  "exercises": [
    {
      "id": "1",
      "question": "Kesyon 1",
      "answer": "Repons (opsyonèl)"
    }
  ]
}

INSTRIKSYON ESPESYAL:
- Genyen 5-8 kesyon
- Kesyon yo dwe apwopriye pou nivo "${level}"
- Repons yo dwe enkli pou elèv ka tjek pwòp repons li
- Itilize ${language === Language.KREYOL ? 'Kreyòl Ayisyen' : 'Français'}
- PA JENERE OKENN TÈKS DEYÒ FÒMA JSON AN
`;

    const response = await getAIResponse({
        prompt,
        selectedModule: ModuleType.QUESTION_GENERATOR,
        studentLevel: level,
        responseLanguage: language,
        onChunk: () => { },
        aiProvider: aiProvider as any,
        ollamaModel,
    });

    return JSON.parse(response);
};

// Convert worksheet to printable HTML
export const worksheetToHTML = (worksheet: Worksheet): string => {
    const exercisesHTML = worksheet.exercises
        .map((ex, index) => `
      <div class="exercise" style="margin-bottom: 20px; page-break-inside: avoid;">
        <p style="font-weight: bold; margin-bottom: 10px;">${index + 1}. ${ex.question}</p>
        ${ex.answer ? `
          <div style="margin-top: 30px; padding: 10px; border: 1px dashed #ccc; color: #666;">
            <strong>Repons:</strong> ${ex.answer}
          </div>
        ` : ''}
      </div>
    `)
        .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${worksheet.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #333;
    }
    .meta {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
    }
    .instructions {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    @media print {
      body { padding: 20px; }
      .exercise { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${worksheet.title}</h1>
  <div class="meta">
    <p><strong>Sijè:</strong> ${worksheet.subject} | <strong>Nivo:</strong> ${worksheet.level}</p>
  </div>
  <div class="instructions">
    <strong>Enstriksyon:</strong> ${worksheet.instructions}
  </div>
  ${exercisesHTML}
</body>
</html>
  `.trim();
};

// Download worksheet as HTML file
export const downloadWorksheet = (worksheet: Worksheet): void => {
    const html = worksheetToHTML(worksheet);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${worksheet.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
