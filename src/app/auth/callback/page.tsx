"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (!error) {
                    // Session is now stored in localStorage by the same client
                    // the rest of the app uses — no more mismatch!
                    router.push('/dashboard');
                    return;
                }
                setError('שגיאה בהתחברות. נסה שוב.');
            } else {
                setError('לא התקבל קוד אימות.');
            }

            // On error, wait a moment then redirect to login
            setTimeout(() => router.push('/login'), 2000);
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-[#E8E2D2]">
            {error ? (
                <p className="text-red-600 font-medium">{error}</p>
            ) : (
                <>
                    <Loader2 className="w-10 h-10 text-amber-700 animate-spin" />
                    <p className="text-amber-900 italic font-medium">מתחבר...</p>
                </>
            )}
        </div>
    );
}
