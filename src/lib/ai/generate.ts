import { HttpError } from '../supabase-server';
import { generateClaudeText, isClaudeConfigured } from './claude';
import { generateGeminiText, isGeminiEnabled } from './gemini';

/**
 * Asks the AI for a JSON object and parses it.
 * Claude answers first. Gemini is a fallback only when GEMINI_FALLBACK=true,
 * because on Google's unpaid tier submitted content may be used and reviewed.
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
    if (isClaudeConfigured()) {
        try {
            return parseJSON<T>(await generateClaudeText({ system, prompt }));
        } catch (e) {
            console.error('Claude request failed:', e);
        }
    }

    if (isGeminiEnabled()) {
        try {
            return parseJSON<T>(await generateGeminiText({ system, prompt, temperature }));
        } catch (e) {
            console.error('Gemini request failed:', e);
        }
    }

    throw new HttpError(502, 'AI request failed');
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
