import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpError } from '../supabase-server';

// "gemini-flash-latest" always points at Google's current Flash model,
// so the app does not break when a specific version is retired.
// Pin a specific model with GEMINI_MODEL if output must stay stable.
const DEFAULT_MODEL = 'gemini-flash-latest';

/**
 * Asks Gemini for a JSON object and parses it.
 * The system prompt carries the persona; the prompt carries the data.
 */
export async function generateJSON<T>({
    system,
    prompt,
    temperature = 0.8,
}: {
    system: string;
    prompt: string;
    temperature?: number;
}): Promise<T> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new HttpError(500, 'AI is not configured');

    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
        systemInstruction: system,
        generationConfig: { responseMimeType: 'application/json', temperature },
    });

    let text: string;
    try {
        const result = await model.generateContent(prompt);
        text = result.response.text();
    } catch (e) {
        console.error('Gemini request failed:', e);
        throw new HttpError(502, 'AI request failed');
    }

    try {
        return JSON.parse(stripFences(text)) as T;
    } catch {
        console.error('Gemini returned invalid JSON:', text.slice(0, 500));
        throw new HttpError(502, 'AI returned an invalid answer');
    }
}

function stripFences(s: string): string {
    return s.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
}

/** Keeps only non-empty strings from an AI answer, trimmed and length-capped. */
export function cleanText(v: unknown, max = 2000): string {
    return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
