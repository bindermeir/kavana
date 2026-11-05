'use client';

import React, { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfile } from '@/lib/storage';
import { nextWeeklyQuestion } from '@/lib/onboarding';
import { sendTelemetry } from '@/lib/admin';
import type { UserProfile } from '@/lib/types';
import QuestionBody from '@/components/onboarding/QuestionBody';
import { useKavana } from './KavanaContext';

/** One getting-to-know question a day, through the first week. Never more than one. */
export default function GettingToKnowCard() {
    const { profile, setProfile, today } = useKavana();
    const question = useMemo(() => nextWeeklyQuestion(profile, today), [profile, today]);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<Partial<UserProfile>>(profile);
    const [saving, setSaving] = useState(false);

    if (!question) return null;

    const save = async (answered: boolean) => {
        setSaving(true);
        try {
            const saved = await updateProfile({
                ...(answered ? draft : {}),
                answered_questions: answered ? [...profile.answered_questions, question.key] : profile.answered_questions,
                last_question_date: today,
            });
            setProfile(saved);
            setDraft(saved);
            setOpen(false);
            if (answered) {
                sendTelemetry('question_answered', { key: question.key });
                toast.success('תודה. הכוונה של מחר תכיר אותך קצת יותר.');
            }
        } catch {
            toast.error('לא הצלחנו לשמור. נסו שוב.');
        } finally {
            setSaving(false);
        }
    };

    if (!open) {
        return (
            <button onClick={() => { setDraft(profile); setOpen(true); }} className="w-full text-right rounded-2xl border border-dashed border-accent-border/50 p-5 space-y-1 hover:bg-card/60 transition-colors">
                <p className="label">שאלה אחת להיום</p>
                <p className="font-serif text-xl">{question.title}</p>
                <p className="text-sm text-text-secondary">{question.subtitle}</p>
            </button>
        );
    }

    return (
        <div className="sacred-card space-y-6">
            <div className="space-y-1">
                <p className="label">שאלה אחת להיום</p>
                <h2 className="text-2xl font-bold">{question.title}</h2>
                <p className="text-text-secondary">{question.subtitle}</p>
            </div>
            <QuestionBody qkey={question.key} draft={draft} setDraft={setDraft} />
            <div className="flex gap-3">
                <button className="btn-primary flex-1" disabled={saving || !question.isAnswered(draft)} onClick={() => save(true)}>
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'שמירה'}
                </button>
                <button className="btn-quiet" disabled={saving} onClick={() => save(false)}>
                    לא היום
                </button>
            </div>
        </div>
    );
}
