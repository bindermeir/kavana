'use client';

import React from 'react';
import type { UserProfile } from '@/lib/types';
import {
    QuestionKey, BELIEFS, VALUES, STATES, STRENGTHS, WORK, RELATIONSHIP_STATUS, RELATIONSHIP_APPROACH,
    BOUNDARIES, TRADITIONS, TONES, SCROLL_TIMING,
} from '@/lib/onboarding';

type Draft = Partial<UserProfile>;

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button type="button" className="chip" aria-pressed={selected} onClick={onClick}>
            {children}
        </button>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <p className="label">{label}</p>
            {children}
        </div>
    );
}

/** The inputs for one getting-to-know question. Shared by onboarding, the daily card and the profile. */
export default function QuestionBody({
    qkey,
    draft,
    setDraft,
}: {
    qkey: QuestionKey;
    draft: Draft;
    setDraft: (fn: (d: Draft) => Draft) => void;
}) {
    const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) => setDraft((d) => ({ ...d, [k]: v }));
    const toggle = (k: 'core_values' | 'personal_abilities' | 'content_boundaries' | 'cultural_connections' | 'calendar_subscriptions', v: string) =>
        setDraft((d) => {
            const arr = (d[k] as string[] | undefined) || [];
            return { ...d, [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] };
        });
    const grid = 'grid grid-cols-2 gap-2.5';

    switch (qkey) {
        case 'basics':
            return (
                <div className="space-y-7">
                    <Field label="איך לקרוא לך?">
                        <input
                            className="input w-full text-2xl font-bold"
                            value={draft.name || ''}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="השם שלך"
                            autoComplete="given-name"
                        />
                    </Field>
                    <Field label="איך לפנות אליך?">
                        <div className="grid grid-cols-3 gap-2.5">
                            <Chip selected={draft.gender === 'm'} onClick={() => set('gender', 'm')}>בלשון זכר</Chip>
                            <Chip selected={draft.gender === 'f'} onClick={() => set('gender', 'f')}>בלשון נקבה</Chip>
                            <Chip selected={draft.gender === 'n'} onClick={() => set('gender', 'n')}>בלי מגדר</Chip>
                        </div>
                    </Field>
                    <Field label="באיזו שפה לכתוב את הכוונות?">
                        <div className="grid grid-cols-2 gap-2.5">
                            <Chip selected={draft.language !== 'en'} onClick={() => set('language', 'he')}>עברית</Chip>
                            <Chip selected={draft.language === 'en'} onClick={() => set('language', 'en')}>English</Chip>
                        </div>
                    </Field>
                </div>
            );

        case 'belief':
            return (
                <div className="space-y-4">
                    <div className={grid}>
                        {BELIEFS.map((b) => (
                            <Chip key={b} selected={draft.belief_system === b} onClick={() => set('belief_system', b)}>{b}</Chip>
                        ))}
                    </div>
                    {draft.belief_system === 'אחר' && (
                        <input className="input w-full" placeholder="ספרו לנו במילים שלכם" value={draft.belief_custom || ''} onChange={(e) => set('belief_custom', e.target.value)} />
                    )}
                    <p className="text-sm text-text-secondary leading-relaxed">
                        מי שחילוני יקבל את הכוונה בשפת הפילוסופיה הסטואית והפסיכולוגיה. מי שמסורתי או דתי, גם בשפת פרקי אבות. תמיד אפשר לשנות.
                    </p>
                </div>
            );

        case 'focus':
            return (
                <textarea
                    className="input w-full h-36 text-lg resize-none"
                    placeholder="לסיים פרויקט, להיות יותר נוכח בבית, לעבור תקופה קשה..."
                    value={draft.current_goal || ''}
                    onChange={(e) => set('current_goal', e.target.value)}
                />
            );

        case 'vision':
            return (
                <div className="space-y-3">
                    <textarea
                        className="input w-full h-40 text-lg resize-none"
                        placeholder="איך נראה יום רגיל בחיים שאתם בונים? איפה, עם מי, מה עושים..."
                        value={draft.future_vision || ''}
                        onChange={(e) => set('future_vision', e.target.value)}
                    />
                    <p className="text-sm text-text-secondary">הכוונה של כל בוקר מחברת את היום אל הכוכב הזה.</p>
                </div>
            );

        case 'values':
            return (
                <div className={grid}>
                    {VALUES.map((v) => (
                        <Chip key={v} selected={!!draft.core_values?.includes(v)} onClick={() => toggle('core_values', v)}>{v}</Chip>
                    ))}
                </div>
            );

        case 'state':
            return (
                <div className={grid}>
                    {STATES.map((s) => (
                        <Chip key={s} selected={draft.current_state === s} onClick={() => set('current_state', s)}>{s}</Chip>
                    ))}
                </div>
            );

        case 'strengths':
            return (
                <div className="space-y-4">
                    <div className={grid}>
                        {STRENGTHS.map((s) => (
                            <Chip key={s} selected={!!draft.personal_abilities?.includes(s)} onClick={() => toggle('personal_abilities', s)}>{s}</Chip>
                        ))}
                    </div>
                    <input className="input w-full" placeholder="עוד משהו שיש בך?" value={draft.abilities_note || ''} onChange={(e) => set('abilities_note', e.target.value)} />
                </div>
            );

        case 'work':
            return (
                <div className={grid}>
                    {WORK.map((w) => (
                        <Chip key={w} selected={draft.work_money_place === w} onClick={() => set('work_money_place', w)}>{w}</Chip>
                    ))}
                </div>
            );

        case 'relationship':
            return (
                <div className="space-y-7">
                    <Field label="איפה זה עומד היום?">
                        <div className={grid}>
                            {RELATIONSHIP_STATUS.map((s) => (
                                <Chip key={s} selected={draft.relationship_status === s} onClick={() => set('relationship_status', s)}>{s}</Chip>
                            ))}
                        </div>
                    </Field>
                    <Field label="איך לדבר על זוגיות בכוונות?">
                        <div className={grid}>
                            {RELATIONSHIP_APPROACH.map((a) => (
                                <Chip key={a} selected={draft.relationship_approach_in_texts === a} onClick={() => set('relationship_approach_in_texts', a)}>{a}</Chip>
                            ))}
                        </div>
                    </Field>
                </div>
            );

        case 'voice':
            return (
                <div className="space-y-7">
                    <Field label="הטון">
                        <div className="grid grid-cols-2 gap-2.5">
                            {TONES.map((t) => (
                                <Chip key={t.value} selected={(draft.tone || 'Adaptive') === t.value} onClick={() => set('tone', t.value)}>{t.label}</Chip>
                            ))}
                        </div>
                    </Field>
                    <Field label="מה לא לכתוב אף פעם?">
                        <div className={grid}>
                            {BOUNDARIES.map((b) => (
                                <Chip key={b} selected={!!draft.content_boundaries?.includes(b)} onClick={() => toggle('content_boundaries', b)}>{b}</Chip>
                            ))}
                        </div>
                    </Field>
                </div>
            );

        case 'tradition':
            return (
                <div className="space-y-7">
                    <div className={grid}>
                        {TRADITIONS.map((t) => (
                            <Chip key={t} selected={!!draft.cultural_connections?.includes(t)} onClick={() => toggle('cultural_connections', t)}>{t}</Chip>
                        ))}
                    </div>
                    <Field label="לוחות שנה שיופיעו בתאריך">
                        <div className="grid grid-cols-2 gap-2.5">
                            <Chip selected={!!draft.calendar_subscriptions?.includes('hebrew')} onClick={() => toggle('calendar_subscriptions', 'hebrew')}>הלוח העברי</Chip>
                            <Chip selected={!!draft.calendar_subscriptions?.includes('zadok')} onClick={() => toggle('calendar_subscriptions', 'zadok')}>לוח בני צדוק</Chip>
                        </div>
                    </Field>
                </div>
            );

        case 'rhythm':
            return (
                <div className="space-y-7">
                    <Field label="תזכורות">
                        <div className="grid grid-cols-3 gap-3">
                            <TimeField label="שחרית" value={draft.morning_reminder_time || '07:00'} onChange={(v) => set('morning_reminder_time', v)} />
                            <TimeField
                                label="מנחה"
                                value={draft.mincha_reminder_time || '13:30'}
                                onChange={(v) => set('mincha_reminder_time', v)}
                                disabled={draft.mincha_reminder_enabled === false}
                            />
                            <TimeField label="ערבית" value={draft.evening_reminder_time || '21:00'} onChange={(v) => set('evening_reminder_time', v)} />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-text-secondary">
                            <input
                                type="checkbox"
                                checked={draft.mincha_reminder_enabled !== false}
                                onChange={(e) => set('mincha_reminder_enabled', e.target.checked)}
                                className="accent-[var(--accent-active)] w-4 h-4"
                            />
                            תזכורת לאיפוס של הצהריים
                        </label>
                    </Field>
                    <Field label="מתי לקבל את המגילה השבועית?">
                        <div className="grid gap-2.5">
                            {SCROLL_TIMING.map((s) => (
                                <Chip key={s.value} selected={(draft.scroll_timing || 'motzash') === s.value} onClick={() => set('scroll_timing', s.value)}>{s.label}</Chip>
                            ))}
                        </div>
                    </Field>
                </div>
            );
    }
}

function TimeField({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
    return (
        <label className={`space-y-1 block ${disabled ? 'opacity-40' : ''}`}>
            <span className="text-xs text-text-secondary">{label}</span>
            <input type="time" className="input w-full" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} dir="ltr" />
        </label>
    );
}
