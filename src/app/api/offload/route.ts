import { getUserContext, errorResponse } from '@/lib/supabase-server';
import { loadProfile, readBody, requireText } from '@/lib/server/data';
import { requireClientDate } from '@/lib/server/dates';
import { generateJSON, cleanText } from '@/lib/ai/generate';
import { systemPrompt, offloadPrompt } from '@/lib/ai/prompts';
import type { Prayer } from '@/lib/types';

const SUPPORT_HE = 'אם זה כבד מדי לשאת לבד, אפשר לדבר עכשיו עם ער"ן בטלפון 1201 (24/7, אנונימי). בסכנה מיידית: 101.';
const SUPPORT_EN = 'If this feels too heavy to carry alone, you can talk to someone right now: ERAN 1201 in Israel (24/7, anonymous), or your local emergency number.';

/** Offload: a listening answer, never advice. Flags distress and points to human help. */
export async function POST(req: Request) {
    try {
        const { supabase, user } = await getUserContext(req);
        const body = await readBody(req);
        const date = requireClientDate(body.date);
        const content = requireText(body.content, 'content', 5000);

        const [profile, morning] = await Promise.all([
            loadProfile(supabase, user.id),
            supabase.from('prayers').select('*').eq('user_id', user.id).eq('date', date).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        ]);

        const ai = await generateJSON<{ response?: string; distress?: boolean }>({
            system: systemPrompt(profile),
            prompt: offloadPrompt({ profile, content, morning: morning.data as Prayer | null }),
            temperature: 0.6,
        });

        const response = cleanText(ai.response, 1200);
        const support = ai.distress === true ? (profile.language === 'en' ? SUPPORT_EN : SUPPORT_HE) : null;

        const { data: saved, error } = await supabase
            .from('offloads')
            .insert({ user_id: user.id, date, content, ai_response: response || null })
            .select()
            .single();
        if (error) throw error;

        return Response.json({ offload: saved, support });
    } catch (e) {
        return errorResponse(e);
    }
}
