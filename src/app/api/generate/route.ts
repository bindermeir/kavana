import { NextResponse } from 'next/server';
import { UserProfile } from '@/lib/storage';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/ai/prompt-builder';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const profile: UserProfile = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API Key is missing. Please add it to .env.local' },
                { status: 500 }
            );
        }

        // 1. Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash", // Reverting to high-quality model for paid plan
            systemInstruction: buildSystemPrompt(profile)
        });

        // 2. Build User Prompt
        const userPrompt = buildUserPrompt({
            profile,
            currentFocus: profile.life_focus_areas?.[0] || 'General Alignment',
            history: (profile as any).history // Passed from client
        });

        // 3. Generate
        console.log('--- Calling Gemini ---');
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const generatedText = response.text();
        console.log('--- Gemini Responded ---');

        return NextResponse.json({
            prayer: generatedText,
            meta: {
                model: 'gemini-1.5-flash',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Generation failed:', errorMessage);
        return NextResponse.json({ error: `Failed to generate prayer: ${errorMessage}` }, { status: 500 });
    }
}
