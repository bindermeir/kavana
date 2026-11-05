import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpError } from '../supabase-server';
import { generateClaudeText, isClaudeConfigured } from './claude';

// "gemini-flash-latest" always points at Google's current Flash model,
// so the app does not break when a specific version is retired.
// Pin a specific model with GEMINI_MODEL if output must stay stable.
const DEFAULT_MODEL = 'gemini-flash-latest';

// Waits before each new attempt when Gemini is overloaded or rate limited.
const RETRY_DELAYS_MS = [1000, 3000];

/**
 * Asks Gemini for a JSON object and parses it, retrying short overloads.
 * If Gemini still cannot answer, falls back to Claude when ANTHROPIC_API_KEY is set.
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
    try {
        return parseJSON<T>(await generateGeminiText({ system, prompt, temperature }));
    } catch (e) {
        console.error('Gemini request failed:', e);
    }

    if (!isClaudeConfigured()) throw new HttpError(502, 'AI request failed');

    try {
        return parseJSON<T>(await generateClaudeText({ system, prompt }));
    } catch (e) {
        console.error('Claude request failed:', e);
        throw new HttpError(502, 'AI request failed');
    }
}

async function generateGeminiText({
    system,
    prompt,
    temperature,
}: {
    system: string;
    prompt: string;
    temperature: number;
}): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
        systemInstruction: system,
        generationConfig: { responseMimeType: 'application/json', temperature },
    });

    for (let attempt = 0; ; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e) {
            if (attempt >= RETRY_DELAYS_MS.length || !isTransient(e)) throw e;
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
        }
    }
}

function isTransient(e: unknown): boolean {
    const status = (e as { status?: number }).status;
    return status === 429 || (status !== undefined && status >= 500);
}

function parseJSON<T>(text: string): T {
    return JSON.parse(stripFences(text)) as T;
}

function stripFences(s: string): string {
    return s.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
}

/** Keeps only non-empty strings from an AI answer, trimmed and length-capped. */
export function cleanText(v: unknown, max = 2000): string {
    return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
