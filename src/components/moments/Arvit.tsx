'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lightbulb, Pencil, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { sendTelemetry } from '@/lib/admin';
import { dayNameHe } from '@/lib/dates';
import type { JournalEntry } from '@/lib/types';
import { useKavana } from '@/components/app/KavanaContext';
import { hebrewDate } from '@/components/app/DateLine';
import ShareSheet from '@/components/share/ShareSheet';
import { MomentHeader, SacredText, Writing, storyVariant } from './shared';

type Field = 'success' | 'capability' | 'gratitude';

const STEPS: { field: Field; title: string; question: string; hint: string; placeholder: string }[] = [
    {
        field: 'success',
        title: 'הצלחתי',
        question: 'מה הצלחת היום?',
        hint: 'אין הצלחה קטנה מדי. גם מילה אחת נחשבת.',
        placeholder: 'הצלחתי ל...',
    },
    {
        field: 'capability',
        title: 'יש בי',
        question: 'איזו יכולת הפעלת כדי שזה יקרה?',
        hint: 'מה ההצלחה הזו אומרת עליך?',
        placeholder: 'יש בי...',
    },
    {
        field: 'gratitude',
        title: 'הכרת הטוב',
        question: 'על מה תודה היום?',
        hint: 'משהו קטן שהיה טוב.',
        placeholder: 'תודה על...',
    },
];

/** Arvit: the evening asif. Evidence → identity → what IS. One field per screen. */
export default function Arvit() {
    const { profile, today, todayIndex, records, refresh, weekLevels } = useKavana();
    const entry = useMemo(() => records.journals.find((j) => j.date === today) || null, [records.journals, today]);
    const morning = useMemo(() => [...records.prayers].reverse().find((p) => p.date === today) || null, [records.prayers, today]);

    const [editing, setEditing] = useState(false);
    const [step, setStep] = useState(0);
    const [values, setValues] = useState<Record<Field, string>>({ success: '', capability: '', gratitude: '' });
    const [writing, setWriting] = useState(false);
    const [showIdea, setShowIdea] = useState(false);
    const [sharing, setSharing] = useState(false);

    const startEdit = () => {
        setValues({ success: entry?.success || '', capability: entry?.capability || '', gratitude: entry?.gratitude || '' });
        setStep(0);
        setEditing(true);
    };

    const submit = async () => {
        setWriting(true);
        try {
            await api<{ entry: JournalEntry }>('/api/asif', { date: today, ...values });
            await refresh();
            setEditing(false);
            sendTelemetry('asif_done');
        } catch (e) {
            console.error(e);
            toast.error('לא הצלחנו לשמור את האסיף. מה שכתבת עדיין כאן, נסו שוב.');
        } finally {
            setWriting(false);
        }
    };

    if (writing) return <Writing text="מזקקים את היום להצהרת היש..." />;

    if (entry && !editing) {
        return (
            <div className="space-y-5">
                <MomentHeader title="הצהרת היש" subtitle="מה שכבר קיים, מתוך מה שהיה היום" />
                <article className="sacred-card space-y-5 text-center">
                    <p className="font-serif text-sm text-accent-active">הצהרת היש</p>
                    {entry.declaration ? <SacredText text={entry.declaration} /> : <p className="text-text-secondary">האסיף נשמר.</p>}
                    <dl className="border-t border-accent-border/50 pt-5 grid grid-cols-3 gap-3 text-sm">
                        {STEPS.map((s) => (
                            <div key={s.field}>
                                <dt className="label">{s.title}</dt>
                                <dd className="text-text-primary">{entry[s.field]}</dd>
                            </div>
                        ))}
                    </dl>
                </article>
                <div className="flex items-center justify-between">
                    <button className="btn-quiet flex items-center gap-2 text-sm" onClick={startEdit}>
                        <Pencil className="w-4 h-4" />
                        עריכה
                    </button>
                    {entry.share_lines && Object.keys(entry.share_lines).length > 0 && (
                        <button className="btn-quiet flex items-center gap-2 font-medium text-accent-active" onClick={() => setSharing(true)}>
                            <Share2 className="w-4 h-4" />
                            משפט היום
                        </button>
                    )}
                </div>
                <p className="text-center text-sacred text-text-secondary">לילה טוב.</p>

                <AnimatePresence>
                    {sharing && (
                        <ShareSheet
                            lines={entry.share_lines}
                            preferred={profile.share_style}
                            kicker={`${dayNameHe(today)} · ${hebrewDate(today)}`}
                            litThrough={todayIndex}
                            levels={weekLevels}
                            variant={storyVariant(todayIndex)}
                            moment="arvit"
                            onClose={() => setSharing(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    const s = STEPS[step];
    const value = values[s.field];
    const isLast = step === STEPS.length - 1;

    return (
        <div className="space-y-6">
            <MomentHeader title="ערבית" subtitle="אוספים את הטוב של היום" />

            <div className="flex justify-center gap-1.5" aria-label={`שלב ${step + 1} מתוך 3`}>
                {STEPS.map((x, i) => (
                    <span key={x.field} className={`h-1.5 rounded-full transition-all ${i <= step ? 'w-6 bg-accent-active' : 'w-1.5 bg-accent-border/40'}`} />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="sacred-card space-y-4">
                    <p className="label">{s.title}</p>
                    <label className="block space-y-3">
                        <span className="font-serif text-2xl block">{s.question}</span>
                        <textarea
                            className="input w-full h-28 resize-none text-lg"
                            placeholder={s.placeholder}
                            value={value}
                            maxLength={1000}
                            autoFocus
                            onChange={(e) => setValues((v) => ({ ...v, [s.field]: e.target.value }))}
                        />
                    </label>
                    <p className="text-sm text-text-muted">{s.hint}</p>

                    {step === 0 && morning && (
                        <div>
                            <button className="btn-quiet !px-0 text-sm flex items-center gap-1.5" onClick={() => setShowIdea((v) => !v)}>
                                <Lightbulb className="w-4 h-4" />
                                צריך רעיון?
                            </button>
                            {showIdea && (
                                <p className="text-sm text-text-secondary leading-relaxed pt-1">
                                    הבוקר כיוונת: &quot;{morning.action_line || morning.content.split('\n')[0]}&quot;. איך זה הלך?
                                </p>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="flex gap-3">
                {step > 0 && (
                    <button className="btn-quiet border border-accent-border/40 !px-4" onClick={() => setStep(step - 1)} aria-label="הקודם">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                )}
                <button
                    className="btn-primary flex-1 text-lg flex items-center justify-center gap-2"
                    disabled={!value.trim()}
                    onClick={() => (isLast ? submit() : setStep(step + 1))}
                >
                    {isLast ? 'לסיים את האסיף' : 'המשך'}
                    {!isLast && <ArrowLeft className="w-5 h-5" />}
                </button>
            </div>
            {editing && (
                <button className="btn-quiet w-full text-sm" onClick={() => setEditing(false)}>
                    ביטול
                </button>
            )}
        </div>
    );
}
