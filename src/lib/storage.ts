export type PrayerStyle = 'formal' | 'casual' | 'poetic';

export interface UserProfile {
    // --- Identity & Basics ---
    id: string; // generated UUID
    name: string;
    phone?: string;
    date_of_birth?: string; // ISO date
    gender: 'male' | 'female' | 'other';
    identity_tags: string[]; // e.g., ["חילוני", "סטודנט"]

    // --- Spiritual Core ---
    belief_system: 'secular' | 'traditional' | 'religious' | 'spiritual';
    religion_relationship: string;
    prayer_meaning: string;
    ideologies: string[];

    // --- Personality & Tone ---
    tone: string;
    communication_style: string;
    cultural_connections: string[];
    cultural_reference_style: string;

    // --- Life State ---
    current_state: string; // e.g., "seeking balance"
    life_focus_areas: string[]; // e.g., ["health", "career"]
    current_challenges: string[];
    emotion_needing_attention?: string;

    // --- Daily Preferences ---
    morning_desire: string;
    notifications_morning: boolean;
    notifications_evening: boolean;
    morning_reminder_time: string; // "08:00"
    evening_reminder_time: string; // "20:00"

    // --- Onboarding Status ---
    onboarding_completed: boolean;
    onboarding_stage: number;

    // --- Deep Psycho-Spiritual Dimensions (Phase 6) ---
    processing_style?: 'head' | 'heart' | 'body'; // How they process (Stoic/Logic vs Emotion vs Action)
    shadow_blocker?: string; // The main internal friction (Fear, Doubt, Anger, etc.)

    // --- Deep Personalization (Phase 5) ---
    bio?: string; // Free-text user story/background
    custom_instructions?: string[]; // Persistent feedback rules

    // --- Comprehensive Onboarding (10 Steps) ---
    // Step 2: Values
    core_values: string[];
    morning_feeling_desire: string;

    // Step 3: Emotional State (partial overlap with existing)
    emotional_state_focus: string; // "regesh" needing attention
    current_intention: string; // Free text

    // Step 4: Relationship
    relationship_status: string;
    relationship_desire: string[];
    relationship_text_style: string;

    // Step 5: Career & Money
    career_money_status: string;
    money_relationship: string;

    // Step 6: Tradition (partial overlap)
    tradition_connection_style: string[]; // cultural hints style

    // Step 7: Strengths
    personal_strengths: string[];
    proud_success?: string;
    success_bank?: string[]; // Phase 11: Bulk successes (CBT Resource)

    // Step 8: Boundaries
    content_boundaries: string[];

    // Step 9: Usage
    reading_timing: string;
    text_purpose: string;

    // Step 10: The Big Question
    perfect_text_vision?: string;
    north_star_vision?: string; // 1-5 year macro goal
    period_goal?: string; // Current month/quarter objective
}

export interface PrayerEntry {
    id: string;
    user_id: string;
    content: string; // The generated prayer text
    date: string; // ISO date string
    style_used: string;
    focus_area?: string; // The specific intention/request

    // --- Phase 10: Deep Memory Snapshots ---
    shadow_snapshot?: string; // What was limiting them (from Profile.shadow_blocker)
    emotional_snapshot?: string; // What they needed (from Profile.emotional_state_focus)
}

export interface JournalEntry {
    id: string;
    user_id: string;
    date: string;
    gratitude_items: string[]; // "3 things that worked"
    daily_success?: string;
    capacity_used?: string; // "Inner tool used today"
    declaration?: string;
    content?: string; // Free text
}

export interface Task {
    id: string;
    user_id: string;
    title: string;
    task_type: 'success_list' | 'capability_list' | 'gratitude_list' | 'reflection' | 'todo';
    content?: string;
    items?: string[]; // List items
    completed: boolean;
    date: string;
}

export interface AnnualReflection {
    id: string;
    user_id: string;
    year: number;
    gratitude_for_year: string[];
    achievements_for_year: string[];
    lessons_learned: string[];
    challenges_faced: string[];
    date: string;
}

// --- Storage Keys ---
const KEYS = {
    PROFILE: 'kavana_user_profile',
    PRAYERS: 'kavana_prayers',
    JOURNAL: 'kavana_journal',
    TASKS: 'kavana_tasks'
};

// --- Helpers ---

// Profile
export function saveProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export function getProfile(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
}

// Prayers (History)
export function savePrayer(prayer: PrayerEntry): void {
    if (typeof window === 'undefined') return;
    const existing = getPrayers();
    const updated = [prayer, ...existing];
    localStorage.setItem(KEYS.PRAYERS, JSON.stringify(updated));
}

export function getPrayers(): PrayerEntry[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.PRAYERS);
    return data ? JSON.parse(data) : [];
}

// Journal
export function saveJournalEntry(entry: JournalEntry): void {
    if (typeof window === 'undefined') return;
    const existing = getJournalEntries();
    const updated = [entry, ...existing.filter(e => e.date !== entry.date)]; // Replace if same date existence
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify(updated));
}

export function getJournalEntries(): JournalEntry[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.JOURNAL);
    return data ? JSON.parse(data) : [];
}
