'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/** Lands here after Google sign-in or an email confirmation link. */
export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            const code = new URLSearchParams(window.location.search).get('code');
            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (!error) return router.replace('/dashboard');
            } else {
                // Links that carry the session in the URL hash are picked up by the client itself.
                const { data } = await supabase.auth.getSession();
                if (data.session) return router.replace('/dashboard');
            }
            setError('ההתחברות לא הצליחה. מחזירים אותך למסך הכניסה...');
            setTimeout(() => router.replace('/login'), 2000);
        };
        run();
    }, [router]);

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
            {error ? (
                <p className="text-text-secondary">{error}</p>
            ) : (
                <>
                    <Loader2 className="w-8 h-8 text-accent-active animate-spin" />
                    <p className="text-sacred text-text-secondary">פותחים את הספר...</p>
                </>
            )}
        </div>
    );
}
