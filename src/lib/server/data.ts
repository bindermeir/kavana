import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../supabase-server';
import { cleanText } from '../ai/gemini';
import type { ShareLines, UserProfile } from '../types';

export async function loadProfile(supabase: SupabaseClient, userId: string): Promise<UserProfile> {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw new HttpError(500, 'Could not load profile');
    if (!data) throw new HttpError(409, 'Profile missing');
    return data as UserProfile;
}

export async function loadPortrait(supabase: SupabaseClient, userId: string): Promise<string> {
    const { data } = await supabase.from('user_memory').select('portrait').eq('user_id', userId).maybeSingle();
    return data?.portrait || '';
}

/** Keeps only the known share styles, as clean short strings. */
export function cleanShareLines(v: unknown): ShareLines {
    const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
    const out: ShareLines = {};
    for (const k of ['mantra', 'choice', 'source', 'source_ref'] as const) {
        const s = cleanText(o[k], 300);
        if (s) out[k] = s;
    }
    return out;
}

/** Reads and validates a JSON body. */
export async function readBody(req: Request): Promise<Record<string, unknown>> {
    try {
        const b = await req.json();
        return b && typeof b === 'object' ? (b as Record<string, unknown>) : {};
    } catch {
        throw new HttpError(400, 'Invalid request');
    }
}

export function requireText(v: unknown, field: string, max = 2000): string {
    const s = cleanText(v, max);
    if (!s) throw new HttpError(400, `Missing ${field}`);
    return s;
}
