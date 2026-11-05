'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RefreshCw, Share2, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { setPrayerFeedback } from '@/lib/storage';
import { sendUserFeedback, sendTelemetry } from '@/lib/admin';
import type { Prayer } from '@/lib/types';
import { useKavana } from '@/components/app/KavanaContext';
import { hebrewDate } from '@/components/app/DateLine';
import { dayNameHe } from '@/lib/dates';
import ShareSheet from '@/components/share/ShareSheet';
import { MomentHeader, SacredText, Writing, storyVariant } from './shared';

const ADJUSTMENTS = ['קצרה יותר', 'רכה יותר', 'ישירה יותר', 'אחרת לגמרי'];

/** Shacharit: one question, one intention, one if-then line for the day. */
export default function Shacharit() {
    const { profile, today, todayIndex, records, refresh, weekLevels } = useKavana();
    const prayer = useMemo(
        () => [...records.prayers].reverse().find((p) => p.date === today) || null,
        [records.prayers, today],
    );

    const [focus, setFocus] = useState('');
    const [writing, setWriting] = useState(false);
    const [adjusting, setAdjusting] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const generate = async (feedback?: string) => {
        setWriting(true);
        setAdjusting(false);
        try {
            await api<{ prayer: Prayer }>('/api/kavana', {
                date: today,
                focus: feedback ? prayer?.focus : focus.trim() || undefined,
                feedback,
            });
            await refresh();
            setScore(null);
            sendTelemetry(feedback ? 'kavana_regenerated' : 'kavana_created');
        } catch (e) {
            console.error(e);
            toast.error('לא הצלחנו לכתוב את הכוונה. נסו שוב בעוד רגע.');
        } finally {
            setWriting(false);
        }
    };

    const rate = async (value: number) => {
        if (!prayer) return;
        setScore(value);
        await Promise.all([
            setPrayerFeedback(prayer.id, value),
            sendUserFeedback(profile.id, 'kavana', prayer.content, value),
        ]);
    };

    if (writing) return <Writing text="כותבים את הכוונה שלך..." />;

    if (!prayer) {
        return (
            <div className="space-y-6">
                <MomentHeader title="בוקר טוב" subtitle="רגע אחד לכוון את היום" />
                <div className="sacred-card space-y-5">
                    <label className="block space-y-3">
                        <span className="font-serif text-xl">מה מעסיק אותך היום?</span>
                        <textarea
                            className="input w-full h-24 resize-none text-lg"
                            placeholder={profile.current_goal ? `למשל: ${profile.current_goal}` : 'פגישה, החלטה, משהו שיושב על הלב...'}
                            value={focus}
                            onChange={(e) => setFocus(e.target.value)}
                            maxLength={500}
                        />
                    </label>
                    <button className="btn-primary w-full text-lg flex items-center justify-center gap-2" onClick={() => generate()}>
                        <Sparkles className="w-5 h-5" />
                        הצת את האור
                    </button>
                    <p className="text-xs text-text-muted text-center">אפשר גם בלי לכתוב כלום</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <MomentHeader title={`בוקר טוב, ${(profile.name || '').split(' ')[0]}`} subtitle="הכוונה שלך להיום" />

            <article className="sacred-card space-y-5 text-center">
                <p className="font-serif text-sm text-accent-active">כוונה לבוקר</p>
                <SacredText text={prayer.content} />
                {prayer.action_line && (
                    <div className="border-t border-accent-border/50 pt-5 space-y-1">
                        <p className="label">המשפט ליום</p>
                        <p className="text-lg font-medium text-accent-active leading-relaxed">{prayer.action_line}</p>
                    </div>
                )}
            </article>

            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    <button className="btn-quiet !p-2.5" aria-label="אהבתי" aria-pressed={score === 1} onClick={() => rate(1)}>
                        <ThumbsUp className={`w-5 h-5 ${score === 1 ? 'fill-current text-accent-active' : ''}`} />
                    </button>
                    <button className="btn-quiet !p-2.5" aria-label="פחות התחבר לי" aria-pressed={score === -1} onClick={() => rate(-1)}>
                        <ThumbsDown className={`w-5 h-5 ${score === -1 ? 'fill-current' : ''}`} />
                    </button>
                    <button className="btn-quiet !p-2.5 flex items-center gap-1.5 text-sm" onClick={() => setAdjusting((v) => !v)}>
                        <RefreshCw className="w-4 h-4" />
                        כוונה אחרת
                    </button>
                </div>
                <button className="btn-quiet flex items-center gap-2 font-medium text-accent-active" onClick={() => setSharing(true)}>
                    <Share2 className="w-4 h-4" />
                    משפט היום
                </button>
            </div>

            {adjusting && (
                <div className="flex flex-wrap gap-2">
                    {ADJUSTMENTS.map((a) => (
                        <button key={a} className="chip !py-2 text-sm" onClick={() => generate(a)}>
                            {a}
                        </button>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {sharing && (
                    <ShareSheet
                        lines={prayer.share_lines}
                        preferred={profile.share_style}
                        kicker={`${dayNameHe(today)} · ${hebrewDate(today)}`}
                        litThrough={todayIndex}
                        levels={weekLevels}
                        variant={storyVariant(todayIndex)}
                        moment="shacharit"
                        onClose={() => setSharing(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
