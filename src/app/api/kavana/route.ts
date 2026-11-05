import { getUserContext, errorResponse, readSystemConfig } from '@/lib/supabase-server';
import { loadProfile, loadPortrait, cleanShareLines, readBody } from '@/lib/server/data';
import { requireClientDate } from '@/lib/server/dates';
import { generateJSON, cleanText } from '@/lib/ai/gemini';
import { systemPrompt, morningPrompt } from '@/lib/ai/prompts';
import { getDailyContext } from '@/lib/ai/calendar-context';
import { addDays } from '@/lib/dates';
import type { JournalEntry, Prayer, Task } from '@/lib/types';

/** Shacharit: writes and saves today's morning intention. */
export async function POST(req: Request) {
    try {
        const { supabase, user } = await getUserContext(req);
        const body = await readBody(req);
        const date = requireClientDate(body.date);
        const focus = cleanText(body.focus, 500) || null;
        const feedback = cleanText(body.feedback, 300) || null;

        const [profile, portrait, adminNote, yesterday, bank, recent] = await Promise.all([
            loadProfile(supabase, user.id),
            loadPortrait(supabase, user.id),
            readSystemConfig('global_ai_prompt_override'),
            supabase.from('journal_entries').select('*').eq('user_id', user.id).eq('date', addDays(date, -1)).maybeSingle(),
            supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
            supabase.from('prayers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        ]);

        const tasks = (bank.data || []) as Task[];
        const calendar = getDailyContext(date, { zadok: profile.calendar_subscriptions.includes('zadok') });

        const ai = await generateJSON<{ kavana?: string; action_line?: string; share_lines?: unknown }>({
            system: systemPrompt(profile, adminNote),
            prompt: morningPrompt({
                profile,
                portrait,
                date,
                calendar,
                focus: focus || profile.current_goal,
                feedback,
                yesterday: yesterday.data as JournalEntry | null,
                successes: tasks.filter((t) => t.task_type === 'success_list').slice(0, 8),
                capabilities: tasks.filter((t) => t.task_type === 'capability_list').slice(0, 8),
                recentKavanot: (recent.data || []) as Prayer[],
            }),
        });

        const content = cleanText(ai.kavana, 1500);
        if (!content) return Response.json({ error: 'AI returned an empty intention' }, { status: 502 });

        const { data: saved, error } = await supabase
            .from('prayers')
            .insert({
                user_id: user.id,
                date,
                content,
                action_line: cleanText(ai.action_line, 300) || null,
                focus,
                share_lines: cleanShareLines(ai.share_lines),
            })
            .select()
            .single();
        if (error) throw error;

        return Response.json({ prayer: saved });
    } catch (e) {
        return errorResponse(e);
    }
}
