import { getUserContext, errorResponse, readSystemConfig } from '@/lib/supabase-server';
import { loadProfile, loadPortrait, cleanShareLines, readBody, requireText } from '@/lib/server/data';
import { requireClientDate } from '@/lib/server/dates';
import { generateJSON, cleanText } from '@/lib/ai/gemini';
import { systemPrompt, eveningPrompt } from '@/lib/ai/prompts';
import type { MinchaCheckin, Prayer, Task } from '@/lib/types';

/**
 * Arvit: saves tonight's asif (success → capability → gratitude),
 * writes the evidence-anchored declaration, and feeds the bank.
 * One entry per day: saving again the same evening updates it.
 */
export async function POST(req: Request) {
    try {
        const { supabase, user } = await getUserContext(req);
        const body = await readBody(req);
        const date = requireClientDate(body.date);
        const success = requireText(body.success, 'success', 1000);
        const capability = requireText(body.capability, 'capability', 1000);
        const gratitude = requireText(body.gratitude, 'gratitude', 1000);

        const [profile, portrait, adminNote, morning, mincha, bank, existing] = await Promise.all([
            loadProfile(supabase, user.id),
            loadPortrait(supabase, user.id),
            readSystemConfig('global_ai_prompt_override'),
            supabase.from('prayers').select('*').eq('user_id', user.id).eq('date', date).order('created_at', { ascending: false }).limit(1).maybeSingle(),
            supabase.from('mincha_checkins').select('*').eq('user_id', user.id).eq('date', date).order('created_at', { ascending: false }).limit(1).maybeSingle(),
            supabase.from('tasks').select('*').eq('user_id', user.id).eq('task_type', 'capability_list').order('created_at', { ascending: false }).limit(8),
            supabase.from('journal_entries').select('id, success, capability').eq('user_id', user.id).eq('date', date).maybeSingle(),
        ]);

        // Save what they wrote first, so a failed AI call never costs them their words.
        const { data: saved, error } = await supabase
            .from('journal_entries')
            .upsert(
                { user_id: user.id, date, success, capability, gratitude, declaration: null, share_lines: {} },
                { onConflict: 'user_id,date' },
            )
            .select()
            .single();
        if (error) throw error;

        // Feed the bank, without duplicating when the asif is edited the same night.
        const prev = existing.data as { success: string | null; capability: string | null } | null;
        const newTasks: Partial<Task>[] = [];
        if (prev?.success !== success) newTasks.push({ user_id: user.id, task_type: 'success_list', content: success, date });
        if (prev?.capability !== capability) newTasks.push({ user_id: user.id, task_type: 'capability_list', content: capability, date });
        if (newTasks.length) await supabase.from('tasks').insert(newTasks);

        // The declaration is a gift on top. Without it the entry stays saved, and editing it tries again.
        try {
            const ai = await generateJSON<{ declaration?: string; share_lines?: unknown }>({
                system: systemPrompt(profile, adminNote),
                prompt: eveningPrompt({
                    profile,
                    portrait,
                    date,
                    success,
                    capability,
                    gratitude,
                    morning: morning.data as Prayer | null,
                    mincha: mincha.data as MinchaCheckin | null,
                    capabilities: (bank.data || []) as Task[],
                }),
            });

            const { data: withDeclaration, error: updateError } = await supabase
                .from('journal_entries')
                .update({ declaration: cleanText(ai.declaration, 1500) || null, share_lines: cleanShareLines(ai.share_lines) })
                .eq('id', saved.id)
                .select()
                .single();
            if (updateError) throw updateError;

            return Response.json({ entry: withDeclaration });
        } catch (e) {
            console.error('Asif saved without a declaration:', e);
            return Response.json({ entry: saved });
        }
    } catch (e) {
        return errorResponse(e);
    }
}
