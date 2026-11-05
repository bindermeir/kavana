"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Menorah from '@/components/menorah/Menorah';
import { dayIndex, localDateStr } from '@/lib/dates';

interface AuthFormProps {
    onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
    const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = mode === 'login'
            ? await signInWithEmail(email, password)
            : await signUpWithEmail(email, password);

        if (result.error) {
            setError(translateError(result.error.message));
        } else if ('needsConfirmation' in result && result.needsConfirmation) {
            setInfo('שלחנו אליך מייל. לחיצה על הקישור שבו תפתח את הספר.');
        } else {
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        const { error } = await signInWithGoogle();
        if (error) {
            setError(translateError(error.message));
            setLoading(false);
        }
    };

    const translateError = (msg: string): string => {
        if (msg.includes('Invalid login credentials')) return 'פרטי ההתחברות שגויים';
        if (msg.includes('Email not confirmed')) return 'יש לאמת את כתובת המייל';
        if (msg.includes('User already registered')) return 'משתמש כבר קיים';
        if (msg.includes('Password should be')) return 'הסיסמה צריכה להכיל לפחות 6 תווים';
        return msg;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm mx-auto p-6"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-28 mx-auto mb-4 flex items-center justify-center"
                >
                    <Menorah litThrough={dayIndex(localDateStr())} className="w-full h-full" />
                </motion.div>
                <h1 className="text-4xl font-bold">כוונה</h1>
                <p className="text-text-secondary text-sm mt-2">
                    {mode === 'login' ? 'ברוכים השבים' : 'פותחים ספר חדש'}
                </p>
            </div>

            {/* Google Login */}
            <motion.button
                onClick={handleGoogleLogin}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-2xl border border-accent-border/40 bg-app-bg/60 hover:bg-app-bg transition-colors mb-6"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-semibold">המשך עם Google</span>
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-accent-border/30" />
                <span className="text-xs text-text-muted font-medium">או</span>
                <div className="flex-1 h-px bg-accent-border/30" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {info && (
                    <p className="p-4 rounded-xl bg-accent-active/10 border border-accent-active/30 text-sm leading-relaxed">{info}</p>
                )}
                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                {/* Email Input */}
                <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                        <Mail className="w-5 h-5" />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="כתובת מייל"
                        required
                        dir="ltr"
                        className="input w-full pr-12 text-right"
                    />
                </div>

                {/* Password Input */}
                <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                        <Lock className="w-5 h-5" />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="סיסמה"
                        required
                        minLength={6}
                        dir="ltr"
                        className="input w-full pr-12 text-right"
                    />
                </div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full text-lg flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {mode === 'login' ? 'התחברות' : 'יצירת חשבון'}
                        </>
                    )}
                </motion.button>
            </form>

            {/* Toggle Mode */}
            <p className="text-center text-sm text-text-secondary mt-8">
                {mode === 'login' ? (
                    <>
                        אין לך חשבון?{' '}
                        <button
                            onClick={() => setMode('signup')}
                            className="text-accent-active font-semibold hover:underline"
                        >
                            הרשמה
                        </button>
                    </>
                ) : (
                    <>
                        יש לך חשבון?{' '}
                        <button
                            onClick={() => setMode('login')}
                            className="text-accent-active font-semibold hover:underline"
                        >
                            התחברות
                        </button>
                    </>
                )}
            </p>
        </motion.div>
    );
}
