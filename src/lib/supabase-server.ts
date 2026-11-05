import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'kavana';

/** A Supabase client bound to Kavana's schema (no generated types). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbClient = SupabaseClient<any, string, any>;

export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

/**
 * Builds a Supabase client that acts AS the calling user, so every query
 * goes through Row Level Security. The browser sends its access token in
 * the Authorization header; we verify it with Supabase before trusting it.
 */
export async function getUserContext(req: Request): Promise<{ supabase: DbClient; user: User }> {
    if (!url || !anonKey) throw new HttpError(500, 'Supabase is not configured');

    const header = req.headers.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new HttpError(401, 'Not signed in');

    const supabase = createClient(url, anonKey, {
        db: { schema },
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new HttpError(401, 'Not signed in');

    return { supabase, user: data.user };
}

/** Service-role client. Bypasses RLS: use only after an explicit admin check. */
export function getServiceClient(): DbClient {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) throw new HttpError(500, 'Service role is not configured');
    return createClient(url, serviceKey, { db: { schema }, auth: { persistSession: false, autoRefreshToken: false } });
}

export function isAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false;
    const admins = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    return admins.includes(email.toLowerCase());
}

/** Reads one admin setting. Returns null when the service role is not configured. */
export async function readSystemConfig(key: string): Promise<string | null> {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
    try {
        const { data } = await getServiceClient()
            .from('system_config')
            .select('config_value')
            .eq('config_key', key)
            .maybeSingle();
        return data?.config_value ?? null;
    } catch {
        return null;
    }
}

/** Turns any thrown error into a JSON response with a safe message. */
export function errorResponse(e: unknown): Response {
    if (e instanceof HttpError) {
        return Response.json({ error: e.message }, { status: e.status });
    }
    console.error(e);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
}
