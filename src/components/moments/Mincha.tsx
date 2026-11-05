'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { saveMincha } from '@/lib/storage';
import { sendTelemetry } from '@/lib/admin';
import { FEELINGS, compassionLines, fallbackReturnLine, feelingLabel } from '@/lib/mincha';
import { useKavana } from '@/components/app/KavanaContext';
import OffloadSheet from '@/components/offload/OffloadSheet';
import { Flame, MomentHeader } from './shared';

type Step = 'start' | 'breathe' | 'feel' | 'compassion' | 'return';

// Cyclic sighing: inhale, a short top-up inhale, then a long slow exhale.
const PHASES = [
    { text: 'שאיפה באף', ms: 2000, scale: 1.35 },
    { text: 'עוד שאיפה קטנה', ms: 1000, scale: 1.55 },
    { text: 'נשיפה ארוכה מהפה', ms: 5000, scale: 0.85 },
];
const CYCLES = 2;

/**
 * Mincha: the midday reset, under a minute. Like the three steps of the Amidah:
 * step out (breathe), look in (name the feeling), step back in (return to the morning).
 */
export default function Mincha() {
    const { profile, today, records, refresh } = useKavana();
    const doneToday = records.minchas.some((m) => m.date === today);
    const morning = useMemo(() => [...records.prayers].reverse().find((p) => p.date === today) || null, [records.prayers, today]);

    const [step, setStep] = useState<Step>('start');
    const [feeling, setFeeling] = useState<string | null>(null);
    const [hard, setHard] = useState(false);
    const [phase, setPhase] = useState(0);
    const [offload, setOffload] = useState(false);
    const [saving, setSaving] = useState(false);

    // Breathing timer
    useEffect(() => {
        if (step !== 'breathe') return;
        if (phase >= PHASES.length * CYCLES) {
            setStep('feel');
            return;
        }
        const t = setTimeout(() => setPhase((p) => p + 1), PHASES[phase % PHASES.length].ms);
        return () => clearTimeout(t);
    }, [step, phase]);

    const begin = () => {
        setPhase(0);
        setFeeling(null);
        setHard(false);
        setStep('breathe');
    };

    const choose = (label: string, isHard: boolean) => {
        setFeeling(label);
        setHard(isHard);
        setStep(isHard ? 'compassion' : 'return');
    };

    const finish = async (path: string) => {
        setSaving(true);
        try {
            await saveMincha(today, feeling, path);
            await refresh();
            sendTelemetry('mincha_done', { path, hard });
            toast.success('הלהבה של היום התחזקה');
            setStep('start');
        } catch {
            toast.error('לא הצלחנו לשמור. נסו שוב.');
        } finally {
            setSaving(false);
        }
    };

    const returnLine = morning?.action_line
        ? { text: morning.action_line, ref: 'מהכוונה של הבוקר' }
        : fallbackReturnLine(profile, new Date(today).getDate());

    return (
        <div className="space-y-6">
            <MomentHeader title="מנחה" subtitle="עצירה קטנה באמצע היום" />

            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sacred-card min-h-72 flex flex-col">
                    {step === 'start' && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
                            <Flame className="w-12" />
                            <p className="text-lg leading-relaxed text-text-secondary">
                                {doneToday ? 'כבר עצרת היום. אפשר לעצור שוב, מתי שצריך.' : 'שלוש נשימות, מילה אחת, וחזרה ליום. פחות מדקה.'}
                            </p>
                            <button className="btn-primary w-full text-lg" onClick={begin}>
                                {doneToday ? 'עוד עצירה' : 'לעצור'}
                            </button>
                        </div>
                    )}

                    {step === 'breathe' && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-8" role="timer" aria-live="polite">
                            <Flame className="w-24" scale={PHASES[phase % PHASES.length].scale} />
                            <p className="text-sacred text-2xl">{PHASES[phase % PHASES.length].text}</p>
                            <button className="btn-quiet text-sm" onClick={() => setStep('feel')}>דילוג</button>
                        </div>
                    )}

                    {step === 'feel' && (
                        <div className="space-y-5">
                            <p className="font-serif text-xl text-center">מה מרגישים עכשיו?</p>
                            <p className="text-sm text-text-secondary text-center">מילה אחת. לתת שם לרגש כבר מרגיע אותו.</p>
                            <div className="grid grid-cols-3 gap-2">
                                {FEELINGS.map((f) => (
                                    <button key={f.label} className="chip !px-2 text-sm" onClick={() => choose(f.label, f.hard)}>
                                        {feelingLabel(f.label, profile.gender)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'compassion' && (
                        <div className="flex-1 flex flex-col justify-center gap-6">
                            <div className="space-y-3 font-serif text-xl leading-relaxed text-center">
                                {compassionLines(profile.gender).map((l, i) => (
                                    <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 1.2 }}>
                                        {l}
                                    </motion.p>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="btn-quiet border border-accent-border/40" onClick={() => setOffload(true)}>
                                    צריך לפרוק
                                </button>
                                <button className="btn-primary" onClick={() => setStep('return')}>
                                    להמשיך
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'return' && (
                        <div className="flex-1 flex flex-col justify-center gap-6 text-center">
                            <p className="label">{returnLine.ref}</p>
                            <p className="font-serif text-2xl leading-relaxed">{returnLine.text}</p>
                            <button className="btn-primary w-full text-lg" onClick={() => finish(hard ? 'compassion' : 'reset')} disabled={saving}>
                                {`חוזרים ליום, ${(profile.name || '').split(' ')[0]}`}
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {offload && (
                    <OffloadSheet
                        onClose={() => setOffload(false)}
                        onDone={() => {
                            setOffload(false);
                            setStep('return');
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
