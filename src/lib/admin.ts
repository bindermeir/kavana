import { supabase } from './supabase';

export interface AdminAlert {
    id: string;
    type: 'custom_culture' | 'custom_belief';
    content: string;
    user_id: string;
    status: 'pending' | 'resolved';
    created_at: string;
}

export async function sendAdminAlert(type: AdminAlert['type'], content: string, userId: string) {
    if (!content.trim()) return;
    
    try {
        await supabase.from('admin_alerts').insert({
            type,
            content,
            user_id: userId,
            status: 'pending'
        });
    } catch (e) {
        console.error('Failed to send admin alert', e);
    }
}

export async function getPendingAlerts(): Promise<AdminAlert[]> {
    try {
        const { data, error } = await supabase
            .from('admin_alerts')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
            
        if (error) return [];
        return data as AdminAlert[];
    } catch (e) {
        console.error('Failed to fetch admin alerts', e);
        return [];
    }
}

export async function resolveAlert(id: string) {
    try {
        await supabase
            .from('admin_alerts')
            .update({ status: 'resolved' })
            .eq('id', id);
    } catch (e) {
        console.error('Failed to resolve alert', e);
    }
}

// ========================================
// Dynamic Cultures
// ========================================

export interface DynamicCulture {
    id: string;
    name: string;
    type: string;
    events_json: { name: string, date: string, type: string }[];
    created_at: string;
}

export async function getDynamicCultures(): Promise<DynamicCulture[]> {
    try {
        const { data, error } = await supabase.from('dynamic_cultures').select('*');
        if (error) return [];
        return data as DynamicCulture[];
    } catch (e) {
        return [];
    }
}

export async function saveDynamicCulture(name: string, type: string, events: any[]) {
    try {
        await supabase.from('dynamic_cultures').insert({
            name,
            type,
            events_json: events
        });
    } catch (e) {
        console.error('Failed to save dynamic culture', e);
    }
}

export async function deleteDynamicCulture(id: string) {
    try {
        await supabase.from('dynamic_cultures').delete().eq('id', id);
    } catch (e) {
        console.error('Failed to delete dynamic culture', e);
    }
}

// ========================================
// System Config (Prompt Tuning)
// ========================================

export async function getSystemConfig(key: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('system_config')
            .select('config_value')
            .eq('config_key', key)
            .single();
            
        if (error || !data) return null;
        return data.config_value;
    } catch (e) {
        return null;
    }
}

export async function updateSystemConfig(key: string, value: string): Promise<void> {
    try {
        await supabase.from('system_config').upsert({
            config_key: key,
            config_value: value,
            updated_at: new Date().toISOString()
        });
    } catch (e) {
        console.error('Failed to update system config', e);
    }
}

// ========================================
// User Feedback & Flags
// ========================================

export interface UserFeedback {
    id: string;
    content_type: string;
    prompt_text: string;
    generated_text: string;
    feedback_score: number;
    feedback_notes?: string;
    created_at: string;
}

export async function sendUserFeedback(feedback: Omit<UserFeedback, 'id' | 'created_at'>) {
    try {
        await supabase.from('user_feedback').insert(feedback);
    } catch (e) {
        console.error('Failed to send feedback', e);
    }
}

export async function getFeedbackLogs(): Promise<UserFeedback[]> {
    try {
        const { data, error } = await supabase.from('user_feedback').select('*').order('created_at', { ascending: false });
        if (error) return [];
        return data as UserFeedback[];
    } catch (e) {
        return [];
    }
}

// ========================================
// Telemetry
// ========================================

export async function sendTelemetry(event_type: string, event_data: any) {
    try {
        await supabase.from('telemetry').insert({
            event_type,
            event_data
        });
    } catch (e) {
        // Silently fail for telemetry
    }
}

export async function getTelemetryStats(): Promise<{ type: string, count: number }[]> {
    try {
        const { data, error } = await supabase.from('telemetry').select('event_type');
        if (error || !data) return [];
        
        const counts: Record<string, number> = {};
        data.forEach(d => {
            counts[d.event_type] = (counts[d.event_type] || 0) + 1;
        });
        
        return Object.entries(counts).map(([type, count]) => ({ type, count }));
    } catch (e) {
        return [];
    }
}
