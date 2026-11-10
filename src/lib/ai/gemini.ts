import { GoogleGenerativeAI } from '@google/generative-ai';

// "gemini-flash-latest" always points at Google's current Flash model,
// so the app does not break when a specific version is retired.
// Pin a specific model with GEMINI_MODEL if output must stay stable.
const DEFAULT_MODEL = 'gemini-flash-latest';

// Waits before each new attempt when Gemini is overloaded or rate limited.
const RETRY_DELAYS_MS = [1000, 3000];

/** Gemini runs only when explicitly turned on, e.g. once its key is on a paid tier. */
export function isGeminiEnabled(): boolean {
    return process.env.GEMINI_FALLBACK === 'true' && !!process.env.GEMINI_API_KEY;
}

/** Asks Gemini for the raw JSON text of an answer, retrying short overloads. */
export async function generateGeminiText({
    system,
    prompt,
    temperature,
}: {
    system: string;
    prompt: string;
    temperature: number;
}): Promise<string> {
    const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '').getGenerativeModel({
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
