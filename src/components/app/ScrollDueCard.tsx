'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, ScrollText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { dueScrollWeek } from '@/lib/scroll';
import { addDays, weekDates } from '@/lib/dates';
import { sendTelemetry } from '@/lib/admin';
import type { WeeklyScroll } from '@/lib/types';
import { useKavana } from './KavanaContext';

/** Appears when the menorah is complete, at the time the user chose. */
export default function ScrollDueCard() {
    const { profile, today, scrolls, levelsByDate, refresh, openBookOn } = useKavana();
    const [busy, setBusy] = useState(false);

    const week = useMemo(() => {
        const w = dueScrollWeek(profile.scroll_timing, today, new Date().getHours(), scrolls);
        if (!w) return null;
        // Only offer a scroll for a week that has something to say.
        const activeDays = weekDates(w).filter((d) => (levelsByDate[d] || 0) > 0).length;
        return activeDays >= 2 ? w : null;
    }, [profile.scroll_timing, today, scrolls, levelsByDate]);

    if (!week) return null;

    const open = async () => {
        setBusy(true);
        try {
            await api<{ scroll: WeeklyScroll }>('/api/scroll', { date: today, weekStart: week });
            await refresh();
            sendTelemetry('scroll_created');
            openBookOn(addDays(week, 6));
        } catch {
            toast.error('לא הצלחנו לכתוב את המגילה. נסו שוב בעוד רגע.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="sacred-card text-center space-y-4">
            <ScrollText className="w-8 h-8 mx-auto text-flame" />
            <div className="space-y-1">
                <h2 className="text-2xl font-bold">המנורה שלמה</h2>
                <p className="text-text-secondary">כל האור של השבוע נאסף למגילה אחת.</p>
            </div>
            <button className="btn-primary w-full" onClick={open} disabled={busy}>
                {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'לפתוח את המגילה השבועית'}
            </button>
        </div>
    );
}
