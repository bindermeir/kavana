import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildWeeklyPrompt } from '@/lib/ai/prompt-builder';
import { supabase } from '@/lib/supabase'; // Import supabase directly for the API

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { profile, weekData } = await req.json();

        // 1. Fetch Offloads for the last 7 days to enable Shadow Analysis
        const { data: offloads, error } = await supabase
            .from('offloads')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(20);

        // Check for Global Prompt Override
        const { getSystemConfig } = require('@/lib/admin');
        const promptOverride = await getSystemConfig('global_ai_prompt_override');

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 2. Build Prompt with Offloads included
        let prompt = buildWeeklyPrompt(profile, {
            ...weekData,
            offloads: offloads || []
        });
        
        if (promptOverride && promptOverride.trim().length > 0) {
            prompt += `\n\nADMIN OVERRIDE RULES (Highest Priority):\n${promptOverride}`;
        }

        const result = await model.generateContent(prompt);
        const scrollContent = result.response.text();

        return NextResponse.json({ scrollContent });
    } catch (error) {
        console.error('Weekly Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate weekly scroll' }, { status: 500 });
    }
}
