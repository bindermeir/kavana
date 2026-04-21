import { supabase } from './supabase';

// --- TYPES ---

export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    future_vision?: string;
    current_goal?: string;
    yearly_intention?: string;
    core_values?: string[];
    belief_system?: string;
    prayer_meaning?: string[];
    tone?: string;
    addressing_mode?: string;
    content_boundaries?: string[];
    shadow_blocker?: string;
    emotional_state_focus?: string;
    morning_reminder_time?: string;
    evening_reminder_time?: string;
    onboarding_completed: boolean;
}

export interface PrayerEntry {
    id: string;
    user_id: string;
    content: string;
    date: string;
    style_used?: string;
    focus_area?: string;
    shadow_snapshot?: string;
    emotional_snapshot?: string;
    is_favorite?: boolean;
}

export interface JournalEntry {
    id: string;
    user_id: string;
    gratitude_items: string;
    daily_success: string;
    capacity_used: string;
    declaration: string;
    date: string;
}

export interface Task {
    id: string;
    user_id: string;
    task_type: 'success_list' | 'capability_list';
    content: string;
    completed: boolean;
    date: string;
}

export interface Offload {
    id: string;
    user_id: string;
    content: string;
    ai_response?: string;
    date: string;
    timestamp: string;
}

// --- CLOUD STORAGE FUNCTIONS (SUPABASE) ---

/**
 * Fetch the current user's profile from Supabase
 */
export async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile:', error);
    }
    return data as UserProfile || null;
}

/**
 * Save/Update the user profile in Supabase
 */
export async function saveProfile(profile: Partial<UserProfile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ ...profile, id: user.id, updated_at: new Date().toISOString() })
        .select()
        .single();

    if (error) {
        console.error('Error saving profile:', error);
        throw error;
    }
    return data;
}

/**
 * Save a new prayer entry
 */
export async function savePrayer(prayer: Omit<PrayerEntry, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('prayers')
        .insert([{ ...prayer, user_id: user.id }]);

    if (error) console.error('Error saving prayer:', error);
}

/**
 * Fetch prayer history
 */
export async function getPrayers() {
    const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching prayers:', error);
        return [];
    }
    return data as PrayerEntry[];
}

/**
 * Save a journal entry
 */
export async function saveJournalEntry(entry: Omit<JournalEntry, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('journal_entries')
        .insert([{ ...entry, user_id: user.id }]);

    if (error) console.error('Error saving journal:', error);
}

/**
 * Fetch journal history
 */
export async function getJournalEntries() {
    const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: false });

    if (error) return [];
    return data as JournalEntry[];
}

/**
 * Save a task (Success/Capability)
 */
export async function saveTask(task: Omit<Task, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('tasks')
        .insert([{ ...task, user_id: user.id }]);

    if (error) console.error('Error saving task:', error);
}

/**
 * Fetch tasks
 */
export async function getTasks() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return [];
    return data as Task[];
}

/**
 * Save an emotional offload
 */
export async function saveOffload(offload: Omit<Offload, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('offloads')
        .insert([{ ...offload, user_id: user.id }]);

    if (error) console.error('Error saving offload:', error);
}

/**
 * Utility to clear data (useful for reset)
 */
export async function clearAllData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // In a real app, you might want to call a RPC or delete multiple tables
    // For now, let's just sign out
    await supabase.auth.signOut();
}
