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
            <div className="flex justify-center gap-8" role="tablist" aria-label="רגעי היום">
                {MOMENTS.map((m) => {
                    const active = m.id === moment;
                    return (
                        <button
                            key={m.id}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setMoment(m.id)}
                            title={m.hint}
                            className={`relative pb-1.5 font-serif text-xl transition-colors border-b-2 ${active ? 'text-text-primary font-bold border-flame' : 'text-text-muted border-transparent hover:text-text-secondary'}`}
                        >
                            {m.label}
                            {done[m.id] && (
                                <Check className="absolute -top-1 -left-3.5 w-3 h-3 text-flame" aria-label="נעשה היום" strokeWidth={3} />
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
