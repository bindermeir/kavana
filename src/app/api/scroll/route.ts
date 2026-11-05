import { getUserContext, errorResponse, readSystemConfig, HttpError } from '@/lib/supabase-server';
import { loadProfile, loadPortrait, cleanShareLines, readBody } from '@/lib/server/data';
import { requireClientDate } from '@/lib/server/dates';
import { generateJSON, cleanText } from '@/lib/ai/gemini';
import { systemPrompt, weeklyPrompt } from '@/lib/ai/prompts';
import { addDays, isDateStr, weekStart as weekStartOf } from '@/lib/dates';
import type { JournalEntry, MinchaCheckin, Offload, Prayer, ScrollContent } from '@/lib/types';

/**
 * The weekly scroll: a synthesis of the week once the menorah is complete.
 * Also refreshes the portrait Kavana keeps of the user (user_memory).
 */
export async function POST(req: Request) {
    try {
        const { supabase, user } = await getUserContext(req);
        const body = await readBody(req);
        const today = requireClientDate(body.date);

        // Only this week or the one before it.
        const start = body.weekStart;
        const thisWeek = weekStartOf(today);
        if (!isDateStr(start) || (start !== thisWeek && start !== addDays(thisWeek, -7))) {
            throw new HttpError(400, 'Invalid week');
        }
        const end = addDays(start, 6);

        const [profile, portrait, adminNote, prayers, minchas, journals, offloads] = await Promise.all([
            loadProfile(supabase, user.id),
            loadPortrait(supabase, user.id),
            readSystemConfig('global_ai_prompt_override'),
            supabase.from('prayers').select('*').eq('user_id', user.id).gte('date', start).lte('date', end).order('date'),
            supabase.from('mincha_checkins').select('*').eq('user_id', user.id).gte('date', start).lte('date', end).order('date'),
            supabase.from('journal_entries').select('*').eq('user_id', user.id).gte('date', start).lte('date', end).order('date'),
            supabase.from('offloads').select('*').eq('user_id', user.id).gte('date', start).lte('date', end).order('date'),
        ]);

        const ai = await generateJSON<Partial<ScrollContent> & { portrait?: string; shadow?: unknown }>({
            system: systemPrompt(profile, adminNote),
            prompt: weeklyPrompt({
                profile,
                portrait,
                weekStart: start,
                prayers: (prayers.data || []) as Prayer[],
                minchas: (minchas.data || []) as MinchaCheckin[],
                journals: (journals.data || []) as JournalEntry[],
                offloads: (offloads.data || []) as Offload[],
            }),
            temperature: 0.7,
        });

        const content: ScrollContent = {
            title: cleanText(ai.title, 120),
            light: cleanText(ai.light, 3000),
            shadow: Array.isArray(ai.shadow) ? ai.shadow.map((s) => cleanText(s, 500)).filter(Boolean).slice(0, 3) : [],
            focus: cleanText(ai.focus, 600),
            share_lines: cleanShareLines(ai.share_lines),
        };
        if (!content.light) throw new HttpError(502, 'AI returned an empty scroll');

        const { data: saved, error } = await supabase
            .from('weekly_scrolls')
            .upsert({ user_id: user.id, week_start: start, content }, { onConflict: 'user_id,week_start' })
            .select()
            .single();
        if (error) throw error;

        const newPortrait = cleanText(ai.portrait, 1200);
        if (newPortrait) {
            await supabase.from('user_memory').upsert({ user_id: user.id, portrait: newPortrait }, { onConflict: 'user_id' });
        }

        return Response.json({ scroll: saved });
    } catch (e) {
        return errorResponse(e);
    }
}
