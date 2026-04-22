"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        const initSession = async () => {
            try {
                // Try to get session from URL first (in case of hash redirect)
                if (window.location.hash.includes('access_token')) {
                    await supabase.auth.getSession();
                }

                const { data: { session: initialSession }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (initialSession) {
                    setSession(initialSession);
                    setUser(initialSession.user);
                }
            } catch (err) {
                console.error('Error initializing session:', err);
            } finally {
                setLoading(false);
            }
        };
        initSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setLoading(false);

            // If we just signed in, let's make sure the cookies are synced
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // This helps ensure the next server-side request sees the cookie
                router.refresh();
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUpWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        return { error };
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signInWithEmail,
            signUpWithEmail,
            signInWithGoogle,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
