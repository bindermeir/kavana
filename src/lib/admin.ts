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
