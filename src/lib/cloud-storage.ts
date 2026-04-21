import { getSupabaseClient } from './supabase';
import { UserProfile, PrayerEntry, JournalEntry } from './storage';

const supabase = getSupabaseClient();

// ========================================
// PROFILE CLOUD SYNC
// ========================================

export async function syncProfileToCloud(profile: UserProfile): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            name: profile.name,
            gender: profile.gender,
            belief_system: profile.belief_system,
            bio: profile.bio,
            custom_instructions: profile.custom_instructions || [],
            processing_style: profile.processing_style,
            shadow_blocker: profile.shadow_blocker,
            core_values: profile.core_values || [],
            success_bank: profile.success_bank || [],
            content_boundaries: profile.content_boundaries || [],
            identity_tags: profile.identity_tags || [],
            life_focus_areas: profile.life_focus_areas || [],
            onboarding_completed: profile.onboarding_completed,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

    return !error;
}

export async function loadProfileFromCloud(): Promise<Partial<UserProfile> | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        name: data.name,
        gender: data.gender,
        belief_system: data.belief_system,
        bio: data.bio,
        custom_instructions: data.custom_instructions || [],
        processing_style: data.processing_style,
        shadow_blocker: data.shadow_blocker,
        core_values: data.core_values || [],
        success_bank: data.success_bank || [],
        content_boundaries: data.content_boundaries || [],
        identity_tags: data.identity_tags || [],
        life_focus_areas: data.life_focus_areas || [],
        onboarding_completed: data.onboarding_completed
    };
}

// ========================================
// PRAYERS CLOUD SYNC
// ========================================

export async function savePrayerToCloud(prayer: PrayerEntry): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('prayers')
        .insert({
            id: prayer.id,
            user_id: user.id,
            content: prayer.content,
            focus_area: prayer.focus_area,
            shadow_snapshot: prayer.shadow_snapshot,
            emotional_snapshot: prayer.emotional_snapshot,
            created_at: prayer.date
        });

    return !error;
}

export async function loadPrayersFromCloud(): Promise<PrayerEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((p: { id: string; user_id: string; content: string; created_at: string; focus_area?: string; shadow_snapshot?: string; emotional_snapshot?: string }) => ({
        id: p.id,
        user_id: p.user_id,
        content: p.content,
        date: p.created_at,
        style_used: 'cloud',
        focus_area: p.focus_area,
        shadow_snapshot: p.shadow_snapshot,
        emotional_snapshot: p.emotional_snapshot
    }));
}

// ========================================
// JOURNAL CLOUD SYNC
// ========================================

export async function saveJournalToCloud(entry: JournalEntry): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('journal_entries')
        .upsert({
            user_id: user.id,
            date: entry.date.split('T')[0], // Just the date part
            gratitude_items: entry.gratitude_items || [],
            daily_success: entry.daily_success,
            declaration: entry.declaration,
            created_at: entry.date
        }, { onConflict: 'user_id,date' });

    return !error;
}

export async function loadJournalFromCloud(): Promise<JournalEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    if (error || !data) return [];

    return data.map((j: { id: string; user_id: string; date: string; gratitude_items?: string[]; daily_success?: string; declaration?: string }) => ({
        id: j.id,
        user_id: j.user_id,
        date: j.date,
        gratitude_items: j.gratitude_items || [],
        daily_success: j.daily_success,
        declaration: j.declaration
    }));
}

// ========================================
// MIGRATION: LocalStorage -> Cloud
// ========================================

export async function migrateLocalStorageToCloud(): Promise<{ success: boolean; migrated: { profile: boolean; prayers: number; journal: number } }> {
    const result = { success: false, migrated: { profile: false, prayers: 0, journal: 0 } };

    try {
        // Migrate Profile
        const localProfile = localStorage.getItem('kavana_user_profile');
        if (localProfile) {
            const profile = JSON.parse(localProfile) as UserProfile;
            const synced = await syncProfileToCloud(profile);
            result.migrated.profile = synced;
        }

        // Migrate Prayers
        const localPrayers = localStorage.getItem('kavana_prayers');
        if (localPrayers) {
            const prayers = JSON.parse(localPrayers) as PrayerEntry[];
            for (const prayer of prayers) {
                const synced = await savePrayerToCloud(prayer);
                if (synced) result.migrated.prayers++;
            }
        }

        // Migrate Journal
        const localJournal = localStorage.getItem('kavana_journal');
        if (localJournal) {
            const entries = JSON.parse(localJournal) as JournalEntry[];
            for (const entry of entries) {
                const synced = await saveJournalToCloud(entry);
                if (synced) result.migrated.journal++;
            }
        }

        result.success = true;
    } catch (e) {
        console.error('Migration failed:', e);
    }

    return result;
}
