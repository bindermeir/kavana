import { supabase } from './supabase';

export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    future_vision?: string;
    current_goal?: string;
    core_values?: string[];
    belief_system?: string;
    prayer_meaning?: string[];
    tone?: 'Adaptive' | 'Direct' | 'Soft' | 'Poetic';
    addressing_mode?: 'Direct' | 'Compassionate' | 'Formal';
    content_boundaries?: string[];
    onboarding_completed?: boolean;
    created_at?: string;
    morning_reminder_time?: string;
    evening_reminder_time?: string;
    // New fields from onboarding refactor
    current_state?: string;
    relationship_status?: string;
    relationship_approach_in_texts?: string;
    work_money_place?: string;
    cultural_connections?: string[];
    personal_abilities?: string[];
    inspiring_people?: string;
    usage_mode?: string;
    language?: 'he' | 'en';
    calendar_subscriptions?: string[];
}

export interface PrayerEntry {
    id: string;
    user_id?: string;
    content: string;
    date: string;
    style_used: string;
    focus_area: string;
    is_favorite?: boolean;
}

export interface JournalEntry {
    id: string;
    user_id?: string;
    gratitude_items: string;
    daily_success: string;
    capacity_used: string;
    declaration: string;
    date: string;
}

export interface Task {
    id: string;
    user_id?: string;
    task_type: 'success_list' | 'capability_list';
    content: string;
    completed: boolean;
    date: string;
}

export interface Offload {
    id: string;
    user_id?: string;
    content: string;
    ai_response?: string;
    date: string;
    timestamp: string;
}

export interface WeeklyScroll {
    id: string;
    user_id?: string;
    content: string;
    start_date: string;
    end_date: string;
    insights?: any;
    created_at?: string;
}

// PROFILE
export async function getProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
    if (error) return null;
    return data;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('user_profiles').upsert({
        ...profile,
        id: user.id, // Enforce id matching auth.uid()
        updated_at: new Date().toISOString()
    });
    if (error) throw error;
}

// PRAYERS
export async function getPrayers(): Promise<PrayerEntry[]> {
    const { data, error } = await supabase.from('prayers').select('*').order('date', { ascending: false });
    if (error) return [];
    return data;
}

export async function savePrayer(prayer: PrayerEntry): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('prayers').insert({
        ...prayer,
        user_id: user.id
    });
    if (error) throw error;
}

// JOURNAL
export async function getJournalEntries(): Promise<JournalEntry[]> {
    const { data, error } = await supabase.from('journal_entries').select('*').order('date', { ascending: false });
    if (error) return [];
    return data;
}

export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('journal_entries').insert({
        ...entry,
        user_id: user.id
    });
    if (error) throw error;
}

// TASKS
export async function getTasks(): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

export async function saveTask(task: Omit<Task, 'user_id'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('tasks').insert({
        ...task,
        user_id: user.id
    });
    if (error) throw error;
}

// OFFLOADS
export async function saveOffload(offload: Omit<Offload, 'user_id'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('offloads').insert({
        ...offload,
        user_id: user.id
    });
    if (error) throw error;
}

// WEEKLY SCROLLS
export async function getWeeklyScrolls(): Promise<WeeklyScroll[]> {
    const { data, error } = await supabase.from('weekly_scrolls').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

export async function saveWeeklyScroll(scroll: Omit<WeeklyScroll, 'user_id'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('weekly_scrolls').insert({
        ...scroll,
        user_id: user.id
    });
    if (error) throw error;
}
