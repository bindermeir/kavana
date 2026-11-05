// Shared data types. Field names match supabase/schema.sql exactly.

export type Language = 'he' | 'en';
export type Tone = 'Adaptive' | 'Direct' | 'Soft' | 'Poetic';
export type ScrollTiming = 'friday' | 'shabbat' | 'motzash';
export type ShareStyle = 'mantra' | 'choice' | 'source';
export type Moment = 'shacharit' | 'mincha' | 'arvit';

export interface UserProfile {
    id: string;
    name: string | null;
    language: Language;
    gender: 'm' | 'f' | 'n' | null;

    belief_system: string | null;
    belief_custom: string | null;
    current_goal: string | null;

    future_vision: string | null;
    core_values: string[];
    current_state: string | null;
    personal_abilities: string[];
    abilities_note: string | null;
    work_money_place: string | null;
    relationship_status: string | null;
    relationship_approach_in_texts: string | null;
    content_boundaries: string[];
    tone: Tone;
    cultural_connections: string[];
    calendar_subscriptions: string[];

    morning_reminder_time: string;
    mincha_reminder_enabled: boolean;
    mincha_reminder_time: string;
    evening_reminder_time: string;
    scroll_timing: ScrollTiming;
    share_style: ShareStyle;

    onboarding_completed: boolean;
    answered_questions: string[];
    last_question_date: string | null;

    created_at?: string;
    updated_at?: string;
}

/** The three ways a shareable "line of the day" can be written. */
export interface ShareLines {
    mantra?: string;
    choice?: string;
    source?: string;
    source_ref?: string;
}

export interface Prayer {
    id: string;
    user_id: string;
    date: string;
    content: string;
    action_line: string | null;
    focus: string | null;
    share_lines: ShareLines;
    feedback_score: number | null;
    created_at: string;
}

export interface MinchaCheckin {
    id: string;
    user_id: string;
    date: string;
    feeling: string | null;
    path: string | null;
    created_at: string;
}

export interface JournalEntry {
    id: string;
    user_id: string;
    date: string;
    success: string | null;
    capability: string | null;
    gratitude: string | null;
    declaration: string | null;
    share_lines: ShareLines;
    created_at: string;
}

export type TaskType = 'success_list' | 'capability_list';

export interface Task {
    id: string;
    user_id: string;
    task_type: TaskType;
    content: string;
    completed: boolean;
    date: string;
    created_at: string;
}

export interface Offload {
    id: string;
    user_id: string;
    date: string;
    content: string;
    ai_response: string | null;
    created_at: string;
}

export interface ScrollContent {
    title: string;
    light: string;
    shadow: string[];
    focus: string;
    share_lines: ShareLines;
}

export interface WeeklyScroll {
    id: string;
    user_id: string;
    week_start: string;
    content: ScrollContent;
    created_at: string;
}

export interface UserMemory {
    user_id: string;
    portrait: string;
    updated_at: string;
}
