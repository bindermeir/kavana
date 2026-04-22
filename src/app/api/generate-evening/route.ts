import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { profile, journal } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are Kavana AI, a spiritual and psychological guide. 
            The user has just completed their evening harvest (אסיף).
            
            USER PROFILE:
            Name: ${profile.name}
            Vision: ${profile.future_vision}
            Core Values: ${profile.core_values?.join(', ')}
            Belief System: ${profile.belief_system}
            Tone: ${profile.tone}

            TODAY'S HARVEST:
            Success: ${journal.daily_success}
            Capability Used: ${journal.capacity_used}
            Gratitude: ${journal.gratitude_items}

            YOUR TASK:
            Generate the "Declaration of IS" (הצהרת היש). 
            This is a powerful, multi-point affirmation written in PRESENT TENSE.
            It should take the user's successes from today and their long-term vision, and blend them into a reality that is ALREADY TRUE.
            
            Structure:
            - Write 5-7 short, powerful sentences.
            - Start with "אני..." or "יש לי...".
            - Focus on: Health, Relationships, Career/Success, Internal State, and Family.
            - The tone should be ${profile.tone === 'Poetic' ? 'lyrical and elevated' : 'direct and grounding'}.
            
            Language: Hebrew.
            Output ONLY the declaration text, no intro or outro.
        `;

        const result = await model.generateContent(prompt);
        const declaration = result.response.text();

        return NextResponse.json({ declaration });
    } catch (error) {
        console.error('Evening Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate evening declaration' }, { status: 500 });
    }
}
