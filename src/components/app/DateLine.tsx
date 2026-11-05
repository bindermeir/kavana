'use client';

import { useMemo } from 'react';
import { HDate } from 'hebcal';
import { getZadokDate } from '@/lib/calendar/zadokCalendar';
import { dayNameHe, parseLocalDate } from '@/lib/dates';

export function hebrewDate(dateStr: string): string {
    try {
        return new HDate(parseLocalDate(dateStr)).toString('h');
    } catch {
        return '';
    }
}

/** One quiet line of date. The Zadok date appears only for those who chose it. */
export default function DateLine({ date, zadok }: { date: string; zadok?: boolean }) {
    const he = useMemo(() => hebrewDate(date), [date]);
    const z = useMemo(() => (zadok ? getZadokDate(parseLocalDate(date)) : null), [date, zadok]);
    return (
        <div className="text-center leading-snug">
            <p className="text-sm text-text-secondary">
                {dayNameHe(date)}
                {he && <> · {he}</>}
            </p>
            {z && (
                <p className="text-xs text-text-muted mt-0.5">
                    לוח בני צדוק: {z.displayText}
                    {z.festival && <> · {z.festival}</>}
                </p>
            )}
        </div>
    );
}
