/**
 * pdfService.ts
 * Ekstrè tèks nan PDF dirèkteman nan navigatè avèk pdf.js
 */
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source to the local file for better reliability and offline support
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

export interface PDFExtractionResult {
    text: string;
    pageCount: number;
    fileName: string;
}

/**
 * Chaje PDF pa URL (pou egzamen pre-chaje nan /exams/ folder)
 * Diferan de extractTextFromPDF ki mande yon File objè.
 */
export async function extractTextFromPDFUrl(url: string): Promise<PDFExtractionResult> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Echèk chajman PDF: ${response.status} — ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pageCount = pdf.numPages;
    const textParts: string[] = [];
    const maxPages = Math.min(pageCount, 60);

    for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (pageText) {
            textParts.push(`[Paj ${i}]\n${pageText}`);
        }
    }

    const fileName = url.split('/').pop() || url;
    return {
        text: textParts.join('\n\n'),
        pageCount,
        fileName,
    };
}

export async function extractTextFromPDF(file: File, onProgress?: (current: number, total: number) => void): Promise<PDFExtractionResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pageCount = pdf.numPages;
    const textParts: string[] = [];

    const maxPages = Math.min(pageCount, 60);

    for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (pageText) {
            textParts.push(`[Paj ${i}]\n${pageText}`);
        }
        onProgress?.(i, maxPages);
    }

    return {
        text: textParts.join('\n\n'),
        pageCount,
        fileName: file.name,
    };
}
