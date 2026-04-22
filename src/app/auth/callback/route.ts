import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/login';

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete({ name, ...options });
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const host = request.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        if (!error) {
            const response = NextResponse.redirect(`${baseUrl}${next}`);
            response.headers.set('Cache-Control', 'no-store, max-age=0');
            return response;
        }
    }

    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    const errorResponse = NextResponse.redirect(`${baseUrl}/`);
    errorResponse.headers.set('Cache-Control', 'no-store, max-age=0');
    return errorResponse;
}
