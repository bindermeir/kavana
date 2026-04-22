import { NextResponse } from 'next/server';
import { UserProfile, getTasks, getPrayers, getJournalEntries } from '@/lib/storage';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/ai/prompt-builder';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const profile: UserProfile = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
        }

        // 1. Fetch real-time resources from DB (for resource injection)
        // Note: In a real server environment, we'd use the user_id to fetch.
        // For this architecture, we assume the profile object passed contains history or we fetch it.
        const tasks = await getTasks();
        const recentPrayers = await getPrayers();
        const recentJournal = await getJournalEntries();

        // Check for Global Prompt Override
        const { getSystemConfig } = require('@/lib/admin');
        const promptOverride = await getSystemConfig('global_ai_prompt_override');

        // 2. Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        
        let systemInstruction = buildSystemPrompt(profile);
        if (promptOverride && promptOverride.trim().length > 0) {
            systemInstruction += `\n\nADMIN OVERRIDE RULES (Highest Priority):\n${promptOverride}`;
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction,
        });

        // 3. Build User Prompt with full history
        const userPrompt = buildUserPrompt({
            profile,
            currentFocus: profile.current_goal || 'General Alignment',
            history: {
                recentPrayers: recentPrayers.slice(0, 3),
                recentJournal: recentJournal.slice(0, 3),
                tasks: tasks
            }
        });

        // 4. Generate
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const generatedText = response.text();

        return NextResponse.json({
            prayer: generatedText,
            meta: { timestamp: new Date().toISOString() }
        });

    } catch (error) {
        console.error('Generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
    }
}
