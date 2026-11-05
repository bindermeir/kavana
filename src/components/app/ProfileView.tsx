'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Loader2, LogOut, Moon, Sun, SunMoon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { deleteMemory, getMemory, saveMemory, updateProfile } from '@/lib/storage';
import { DAY_ONE, WEEK_ONE, Question, QuestionKey, TONES, SCROLL_TIMING } from '@/lib/onboarding';
import type { UserProfile } from '@/lib/types';
import Sheet from '@/components/ui/Sheet';
import QuestionBody from '@/components/onboarding/QuestionBody';
import { useTheme } from '@/components/ThemeProvider';
import { useKavana } from './KavanaContext';

const ALL: Question[] = [...DAY_ONE, ...WEEK_ONE];

function summary(key: QuestionKey, p: UserProfile): string {
    const list = (a: string[]) => (a.length ? a.join(', ') : '');
    switch (key) {
        case 'basics': return [p.name, p.language === 'en' ? 'English' : 'עברית'].filter(Boolean).join(' · ');
        case 'belief': return p.belief_custom || p.belief_system || '';
        case 'focus': return p.current_goal || '';
        case 'vision': return p.future_vision || '';
        case 'values': return list(p.core_values);
        case 'state': return p.current_state || '';
        case 'strengths': return list([...p.personal_abilities, ...(p.abilities_note ? [p.abilities_note] : [])]);
        case 'work': return p.work_money_place || '';
        case 'relationship': return p.relationship_status || '';
        case 'voice': return [TONES.find((t) => t.value === p.tone)?.label, p.content_boundaries.length ? `בלי: ${list(p.content_boundaries)}` : ''].filter(Boolean).join(' · ');
        case 'tradition': return list(p.cultural_connections);
        case 'rhythm': return `${p.morning_reminder_time} · ${p.mincha_reminder_enabled ? p.mincha_reminder_time : 'בלי מנחה'} · ${p.evening_reminder_time} · מגילה ${SCROLL_TIMING.find((s) => s.value === p.scroll_timing)?.label || ''}`;
    }
}

/** "Me": everything Kavana knows, visible and editable. Nothing hidden. */
export default function ProfileView() {
    const { profile, setProfile } = useKavana();
    const { mode, setMode } = useTheme();
    const [editing, setEditing] = useState<Question | null>(null);
    const [draft, setDraft] = useState<Partial<UserProfile>>(profile);
    const [saving, setSaving] = useState(false);
    const [portrait, setPortrait] = useState<string | null>(null);
    const [portraitDraft, setPortraitDraft] = useState('');

    useEffect(() => {
        getMemory().then((m) => {
            setPortrait(m?.portrait || '');
            setPortraitDraft(m?.portrait || '');
        });
    }, []);

    const save = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const answered = Array.from(new Set([...profile.answered_questions, editing.key]));
            const saved = await updateProfile({ ...draft, answered_questions: answered });
            setProfile(saved);
            setEditing(null);
            toast.success('נשמר');
        } catch {
            toast.error('לא הצלחנו לשמור');
        } finally {
            setSaving(false);
        }
    };

    const savePortrait = async () => {
        try {
            await saveMemory(portraitDraft.trim());
            setPortrait(portraitDraft.trim());
            toast.success('נשמר');
        } catch {
            toast.error('לא הצלחנו לשמור');
        }
    };

    const forget = async () => {
        if (!confirm('למחוק את כל מה שכוונה למדה עליך? הפרופיל וההיסטוריה נשארים.')) return;
        await deleteMemory();
        setPortrait('');
        setPortraitDraft('');
        toast.success('נמחק');
    };

    const logout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-text-secondary">כל מה שכוונה יודעת עליך, גלוי ופתוח לעריכה</p>
            </div>

            <section className="sacred-card !p-0 overflow-hidden">
                <ul className="divide-y divide-accent-border/15">
                    {ALL.map((q) => {
                        const s = summary(q.key, profile);
                        return (
                            <li key={q.key}>
                                <button
                                    className="w-full text-right px-5 py-4 flex items-center justify-between gap-4 hover:bg-app-bg/50 transition-colors"
                                    onClick={() => { setDraft(profile); setEditing(q); }}
                                >
                                    <span className="min-w-0">
                                        <span className="block font-medium">{q.title}</span>
                                        <span className={`block text-sm truncate ${s ? 'text-text-secondary' : 'text-text-muted italic'}`}>{s || 'עוד לא סיפרת'}</span>
                                    </span>
                                    <ChevronLeft className="w-4 h-4 text-text-muted shrink-0" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </section>

            <section className="sacred-card space-y-4">
                <div>
                    <h2 className="text-xl font-bold">מה כוונה למדה עליך</h2>
                    <p className="text-sm text-text-secondary">מתעדכן עם כל מגילה שבועית, כדי שהכוונות ילכו ויתדייקו. אפשר לתקן או למחוק.</p>
                </div>
                {portrait === null ? (
                    <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
                ) : (
                    <>
                        <textarea
                            className="input w-full h-32 resize-y text-sm leading-relaxed"
                            value={portraitDraft}
                            placeholder="עוד אין כאן כלום. אחרי המגילה הראשונה יופיע כאן מה שכוונה למדה."
                            onChange={(e) => setPortraitDraft(e.target.value)}
                            maxLength={1200}
                        />
                        <div className="flex gap-2">
                            <button className="btn-primary !py-2 text-sm" disabled={portraitDraft === portrait} onClick={savePortrait}>
                                שמירה
                            </button>
                            {portrait && (
                                <button className="btn-quiet text-sm flex items-center gap-1.5" onClick={forget}>
                                    <Trash2 className="w-4 h-4" />
                                    למחוק הכל
                                </button>
                            )}
                        </div>
                    </>
                )}
            </section>

            <section className="space-y-3">
                <p className="label">מראה</p>
                <div className="grid grid-cols-3 gap-2">
                    {([
                        ['auto', 'לפי השעה', SunMoon],
                        ['light', 'יום', Sun],
                        ['dark', 'לילה', Moon],
                    ] as const).map(([m, label, Icon]) => (
                        <button key={m} className="chip flex items-center justify-center gap-1.5 text-sm" aria-pressed={mode === m} onClick={() => setMode(m)}>
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            <section className="flex items-center justify-between text-sm">
                <Link href="/about" className="btn-quiet !px-0">על כוונה</Link>
                <button className="btn-quiet flex items-center gap-1.5" onClick={logout}>
                    <LogOut className="w-4 h-4" />
                    התנתקות
                </button>
            </section>

            <AnimatePresence>
                {editing && (
                    <Sheet title={editing.title} onClose={() => setEditing(null)}>
                        <div className="space-y-6">
                            <p className="text-text-secondary">{editing.subtitle}</p>
                            <QuestionBody qkey={editing.key} draft={draft} setDraft={setDraft} />
                            <button className="btn-primary w-full" disabled={saving || !editing.isAnswered(draft)} onClick={save}>
                                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'שמירה'}
                            </button>
                        </div>
                    </Sheet>
                )}
            </AnimatePresence>
        </div>
    );
}
