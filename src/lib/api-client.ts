import { supabase } from './supabase';

/** Calls our own API with the user's access token, so the server knows who is asking. */
export async function api<T>(path: string, body?: unknown, method: 'POST' | 'GET' = 'POST'): Promise<T> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const res = await fetch(path, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
    return json as T;
}
