'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { getProfile, updateProfile } from '@/lib/storage';
import { sendAdminAlert, sendTelemetry } from '@/lib/admin';
import { DAY_ONE, WEEK_ONE, Question } from '@/lib/onboarding';
import { dayIndex, localDateStr } from '@/lib/dates';
import type { UserProfile } from '@/lib/types';
import QuestionBody from './QuestionBody';
import Menorah from '@/components/menorah/Menorah';

type Phase = 'day-one' | 'crossroads' | 'deep';

/**
 * Day one: three questions, then the first candle.
 * Whoever wants more can go deep right away ("בוא נכיר לעומק").
 */
export default function OnboardingWizard() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [phase, setPhase] = useState<Phase>('day-one');
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState<Partial<UserProfile>>({ language: 'he', tone: 'Adaptive' });

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/login');
            return;
        }
        getProfile().then((p) => {
            if (p?.onboarding_completed) {
                router.replace('/dashboard');
                return;
            }
            const metaName = (user.user_metadata?.full_name || user.user_metadata?.name || '') as string;
            setDraft((d) => ({ ...d, ...(p || {}), name: p?.name || metaName.split(' ')[0] || '' }));
        });
    }, [user, loading, router]);

    const questions: Question[] = phase === 'deep' ? WEEK_ONE : DAY_ONE;
    const q = questions[step];
    const isLast = step === questions.length - 1;

    const save = async (patch: Partial<UserProfile>) => {
        setSaving(true);
        try {
            const saved = await updateProfile(patch);
            setDraft(saved);
            return saved;
        } catch (e) {
            console.error(e);
            toast.error('לא הצלחנו לשמור. נסו שוב.');
            return null;
        } finally {
            setSaving(false);
        }
    };

    const next = async () => {
        if (!q.isAnswered(draft)) return;

        if (phase === 'day-one') {
            if (!isLast) return setStep(step + 1);
            const saved = await save({
                ...draft,
                onboarding_completed: true,
                answered_questions: DAY_ONE.map((x) => x.key),
                calendar_subscriptions: draft.calendar_subscriptions?.length
                    ? draft.calendar_subscriptions
                    : /דתי|מסורתי/.test(draft.belief_system || '') ? ['hebrew'] : [],
            });
            if (!saved) return;
            if (user && draft.belief_system === 'אחר' && draft.belief_custom) {
                sendAdminAlert('custom_belief', draft.belief_custom, user.id);
            }
            sendTelemetry('onboarding_day_one', { belief_system: draft.belief_system, language: draft.language });
            setPhase('crossroads');
            return;
        }

        // deep: save each answer as we go, so leaving halfway keeps everything
        const answered = Array.from(new Set([...(draft.answered_questions || []), q.key]));
        const saved = await save({ ...draft, answered_questions: answered });
        if (!saved) return;
        if (isLast) {
            sendTelemetry('onboarding_deep_complete');
            router.push('/dashboard');
        } else {
            setStep(step + 1);
        }
    };

    const back = () => (step > 0 ? setStep(step - 1) : undefined);

    const logout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (phase === 'crossroads') {
        const today = dayIndex(localDateStr());
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto gap-8">
                <Menorah litThrough={today} todayIndex={today} levels={Array(7).fill(0)} evening={false} className="w-44" />
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold">הנר של היום מוכן</h1>
                    <p className="text-text-secondary leading-relaxed">
                        הכוונה הראשונה תדליק אותו. בכל יום השבוע נשאל שאלה אחת קטנה, וכל תשובה תעשה את הכוונה של מחר מדויקת יותר.
                        עד השבת המנורה תהיה שלמה, וגם ההיכרות.
                    </p>
                </div>
                <div className="w-full space-y-3">
                    <button className="btn-primary w-full text-lg" onClick={() => router.push('/dashboard')}>
                        להדליק את הנר
                    </button>
                    <button
                        className="btn-quiet w-full"
                        onClick={() => {
                            setPhase('deep');
                            setStep(Math.max(0, WEEK_ONE.findIndex((x) => !(draft.answered_questions || []).includes(x.key))));
                        }}
                    >
                        יש לי זמן עכשיו, בואו נכיר לעומק
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh flex flex-col">
            <header className="px-5 pt-6 max-w-lg mx-auto w-full">
                <div className="flex items-center justify-between">
                    <button onClick={back} disabled={step === 0} className="btn-quiet !p-2 disabled:invisible" aria-label="חזרה">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    {/* progress reads right to left, like the menorah */}
                    <div className="flex gap-1.5" aria-label={`שלב ${step + 1} מתוך ${questions.length}`}>
                        {questions.map((_, i) => (
                            <span
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${i <= step ? 'w-6 bg-accent-active' : 'w-1.5 bg-accent-border/40'}`}
                            />
                        ))}
                    </div>
                    <button onClick={logout} className="btn-quiet !p-2" aria-label="התנתקות">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 px-6 pt-10 max-w-lg mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${phase}-${step}`}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        className="space-y-8"
                    >
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold">{q.title}</h1>
                            <p className="text-text-secondary text-lg">{q.subtitle}</p>
                        </div>
                        <QuestionBody qkey={q.key} draft={draft} setDraft={setDraft} />
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="px-6 pt-4 safe-bottom max-w-lg mx-auto w-full space-y-2">
                <button onClick={next} disabled={saving || !q.isAnswered(draft)} className="btn-primary w-full text-lg flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                            {phase === 'day-one' && isLast ? 'להדליק את הנר הראשון' : isLast ? 'סיום' : 'המשך'}
                            {!isLast && <ArrowLeft className="w-5 h-5" />}
                        </>
                    )}
                </button>
                {phase === 'deep' && (
                    <button className="btn-quiet w-full text-sm" onClick={() => router.push('/dashboard')}>
                        מספיק להיום, נמשיך מחר
                    </button>
                )}
            </footer>
        </div>
    );
}
