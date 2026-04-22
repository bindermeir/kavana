"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { getProfile } from '@/lib/storage';

export default function LoginPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            handleAuthSuccess();
        }
    }, [user, loading]);

    const handleAuthSuccess = async () => {
        // If they successfully log in, check if they already have a profile
        const profile = await getProfile();
        if (profile) {
            router.push('/dashboard');
        } else {
            router.push('/onboarding');
        }
    };

    return (
        <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-accent/20 to-primary/10 blur-3xl" />
            </div>

            <div className="w-full max-w-md sacred-card relative z-10">
                <AuthForm onSuccess={handleAuthSuccess} />
            </div>
        </div>
    );
}
