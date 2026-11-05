import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials are missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

/** Kavana keeps its tables in its own Postgres schema, so it can share a Supabase project. */
export const DB_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'kavana';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: DB_SCHEMA },
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});
