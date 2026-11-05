// Client-side data access. Row Level Security guarantees every query
// only ever sees the signed-in user's own rows.
import { supabase } from './supabase';
import type {
    JournalEntry, MinchaCheckin, Offload, Prayer, Task, TaskType, UserMemory, UserProfile, WeeklyScroll,
} from './types';

async function uid(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
}

async function requireUid(): Promise<string> {
    const id = await uid();
    if (!id) throw new Error('Not signed in');
    return id;
}

// ---------- profile ----------
export async function getProfile(): Promise<UserProfile | null> {
    const id = await uid();
    if (!id) return null;
    const { data } = await supabase.from('user_profiles').select('*').eq('id', id).maybeSingle();
    return (data as UserProfile) || null;
}

export async function updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
    const id = await requireUid();
    // Never let the client move ownership or timestamps.
    const { id: _ignoredId, created_at: _c, updated_at: _u, ...rest } = patch;
    void _ignoredId; void _c; void _u;
    const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ ...rest, id }, { onConflict: 'id' })
        .select()
        .single();
    if (error) throw error;
    return data as UserProfile;
}

// ---------- by date range ----------
export interface DayRecords {
    prayers: Prayer[];
    minchas: MinchaCheckin[];
    journals: JournalEntry[];
    offloads: Offload[];
}

export async function getRange(from: string, to: string): Promise<DayRecords> {
    const id = await uid();
    if (!id) return { prayers: [], minchas: [], journals: [], offloads: [] };
    const q = (table: string) =>
        supabase.from(table).select('*').eq('user_id', id).gte('date', from).lte('date', to).order('created_at', { ascending: true });
    const [p, m, j, o] = await Promise.all([q('prayers'), q('mincha_checkins'), q('journal_entries'), q('offloads')]);
    return {
        prayers: (p.data || []) as Prayer[],
        minchas: (m.data || []) as MinchaCheckin[],
        journals: (j.data || []) as JournalEntry[],
        offloads: (o.data || []) as Offload[],
    };
}

/** How many of the three moments were done on each date (0 to 3). */
export function flameLevels(r: DayRecords): Record<string, number> {
    const days: Record<string, Set<string>> = {};
    const mark = (date: string, m: string) => { (days[date] ||= new Set()).add(m); };
    r.prayers.forEach((x) => mark(x.date, 's'));
    r.minchas.forEach((x) => mark(x.date, 'm'));
    r.journals.forEach((x) => mark(x.date, 'a'));
    return Object.fromEntries(Object.entries(days).map(([d, s]) => [d, s.size]));
}

// ---------- mincha ----------
export async function saveMincha(date: string, feeling: string | null, path: string): Promise<MinchaCheckin> {
    const id = await requireUid();
    const { data, error } = await supabase
        .from('mincha_checkins')
        .insert({ user_id: id, date, feeling, path })
        .select()
        .single();
    if (error) throw error;
    return data as MinchaCheckin;
}

// ---------- prayers ----------
export async function setPrayerFeedback(prayerId: string, score: number) {
    await supabase.from('prayers').update({ feedback_score: score }).eq('id', prayerId);
}

// ---------- bank ----------
export async function getTasks(): Promise<Task[]> {
    const id = await uid();
    if (!id) return [];
    const { data } = await supabase.from('tasks').select('*').eq('user_id', id).order('created_at', { ascending: false });
    return (data || []) as Task[];
}

export async function addTask(task_type: TaskType, content: string, date: string): Promise<Task> {
    const id = await requireUid();
    const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: id, task_type, content, date })
        .select()
        .single();
    if (error) throw error;
    return data as Task;
}

export async function deleteTask(taskId: string) {
    await supabase.from('tasks').delete().eq('id', taskId);
}

// ---------- weekly scrolls ----------
export async function getScrolls(): Promise<WeeklyScroll[]> {
    const id = await uid();
    if (!id) return [];
    const { data } = await supabase.from('weekly_scrolls').select('*').eq('user_id', id).order('week_start', { ascending: false });
    return (data || []) as WeeklyScroll[];
}

// ---------- memory ----------
export async function getMemory(): Promise<UserMemory | null> {
    const id = await uid();
    if (!id) return null;
    const { data } = await supabase.from('user_memory').select('*').eq('user_id', id).maybeSingle();
    return (data as UserMemory) || null;
}

export async function saveMemory(portrait: string) {
    const id = await requireUid();
    const { error } = await supabase.from('user_memory').upsert({ user_id: id, portrait }, { onConflict: 'user_id' });
    if (error) throw error;
}

export async function deleteMemory() {
    const id = await requireUid();
    await supabase.from('user_memory').delete().eq('user_id', id);
}
