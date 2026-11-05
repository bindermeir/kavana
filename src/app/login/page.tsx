'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { getProfile } from '@/lib/storage';

export default function LoginPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading || !user) return;
        getProfile().then((p) => router.replace(p?.onboarding_completed ? '/dashboard' : '/onboarding'));
    }, [user, loading, router]);

    return (
        <div className="min-h-dvh flex items-center justify-center p-4">
            <div className="w-full max-w-md sacred-card">
                <AuthForm />
            </div>
        </div>
    );
}
