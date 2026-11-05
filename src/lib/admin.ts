// User-facing helpers that talk to admin-owned tables.
// Everything admin-only lives behind /api/admin (server, ADMIN_EMAILS).
import { supabase } from './supabase';

/** A user asked for a belief or culture we do not cover yet. */
export async function sendAdminAlert(type: 'custom_culture' | 'custom_belief', content: string, userId: string) {
    if (!content.trim()) return;
    try {
        await supabase.from('admin_alerts').insert({ type, content: content.slice(0, 500), user_id: userId });
    } catch (e) {
        console.error('Failed to send admin alert', e);
    }
}

/** Anonymous product event. Never include personal content here. */
export async function sendTelemetry(event_type: string, event_data: Record<string, unknown> = {}) {
    try {
        await supabase.from('telemetry').insert({ event_type, event_data });
    } catch {
        // telemetry is best-effort
    }
}

export async function sendUserFeedback(userId: string, content_type: string, generated_text: string, feedback_score: number) {
    try {
        await supabase.from('user_feedback').insert({ user_id: userId, content_type, generated_text, feedback_score });
    } catch (e) {
        console.error('Failed to send feedback', e);
    }
}
