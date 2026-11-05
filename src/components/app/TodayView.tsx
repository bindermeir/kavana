'use client';

import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { momentForHour } from '@/lib/dates';
import type { Moment } from '@/lib/types';
import { useKavana } from './KavanaContext';
import Shacharit from '@/components/moments/Shacharit';
import Mincha from '@/components/moments/Mincha';
import Arvit from '@/components/moments/Arvit';
import GettingToKnowCard from './GettingToKnowCard';
import ScrollDueCard from './ScrollDueCard';

const MOMENTS: { id: Moment; label: string; hint: string }[] = [
    { id: 'shacharit', label: 'שחרית', hint: 'התכווננות' },
    { id: 'mincha', label: 'מנחה', hint: 'איפוס' },
    { id: 'arvit', label: 'ערבית', hint: 'אסיף' },
];

/** Opens straight into the moment that fits the hour. The other two are one tap away. */
export default function TodayView() {
    const { records, today } = useKavana();
    const [moment, setMoment] = useState<Moment>(() => momentForHour(new Date().getHours()));
    const [momentDay, setMomentDay] = useState(today);

    // A new day brings the right moment back.
    if (momentDay !== today) {
        setMomentDay(today);
        setMoment(momentForHour(new Date().getHours()));
    }

    const done = useMemo(
        () => ({
            shacharit: records.prayers.some((p) => p.date === today),
            mincha: records.minchas.some((m) => m.date === today),
            arvit: records.journals.some((j) => j.date === today),
        }),
        [records, today],
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-card/70 border border-accent-border/15" role="tablist" aria-label="רגעי היום">
                {MOMENTS.map((m) => {
                    const active = m.id === moment;
                    return (
                        <button
                            key={m.id}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setMoment(m.id)}
                            className={`relative rounded-xl py-2.5 transition-all ${active ? 'bg-app-bg shadow-sm text-text-primary' : 'text-text-muted'}`}
                        >
                            <span className="block font-serif text-lg font-bold leading-tight">{m.label}</span>
                            <span className="block text-[11px]">{m.hint}</span>
                            {done[m.id] && (
                                <Check className="absolute top-1.5 left-2 w-3.5 h-3.5 text-flame" aria-label="נעשה היום" strokeWidth={3} />
                            )}
                        </button>
                    );
                })}
            </div>

            {moment === 'shacharit' && <Shacharit />}
            {moment === 'mincha' && <Mincha />}
            {moment === 'arvit' && <Arvit />}

            <ScrollDueCard />
            <GettingToKnowCard />
        </div>
    );
}
