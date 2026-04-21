import { NextResponse } from 'next/server';
import { UserProfile, JournalEntry } from '@/lib/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { profile, journal }: { profile: UserProfile, journal: JournalEntry } = body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API Key is missing. Please add it to .env.local' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.7,
            }
        });

        const prompt = `
        You are "Kavana AI", a highly adaptive spiritual companion.
        Your task is to write a short, soothing evening reflection (תפילת לילה/סיכום יום) for the user.

        **User Profile (Master Schema):**
        - **Name**: ${profile.name || 'User'}
        - **Belief System**: ${profile.belief_system}
        - **Communication Tone**: ${profile.tone} (Direct/Soft/Poetic)
        - **Prayer Meaning**: ${profile.prayer_meaning?.join(', ')}
        - **Values**: ${profile.core_values?.join(', ')}
        - **Future Vision**: "${profile.future_vision}"
        - **Current Goal**: "${profile.current_goal}"
        - **Gender**: ${profile.gender === 'male' ? 'MASCULINE (לשון זכר)' : 'FEMININE (לשון נקבה)'}

        **Today's Journal Input:**
        - **Gratitude**: ${journal.gratitude_items}
        - **Daily Success**: "${journal.daily_success}"
        - **Capacity/Strength Used**: "${journal.capacity_used}"
        - **Final Declaration**: "${journal.declaration}"

        **Drafting Instructions:**
        1. **Tone**: Use the user's preferred tone (${profile.tone}). If Poetic, use high-level Hebrew. If Direct, be clear and grounded.
        2. **Spirituality**: Align with their belief system (${profile.belief_system}). If they see prayer as "${profile.prayer_meaning?.join(', ')}", use that context.
        3. **Validation**: Acknowledge their specific "Daily Success" and the "Strength" they used today. Validate that this is proof of their capability.
        4. **The Bridge**: Connect today's success to their "Future Vision". Show them that today's small win is a step toward their grand vision.
        5. **Boundaries**: AVOID ${profile.content_boundaries?.join(', ')}.
        6. **Length**: 3-4 short, powerful paragraphs.
        7. **Language**: Hebrew ONLY. Strict ${profile.gender === 'male' ? 'MASCULINE' : 'FEMININE'} grammar.

        **Output:**
        Return ONLY the Hebrew text. No explanations.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();

        return NextResponse.json({
            reflection: generatedText,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Evening generation failed:', errorMessage);
        return NextResponse.json({ error: `Failed to generate reflection: ${errorMessage}` }, { status: 500 });
    }
}
