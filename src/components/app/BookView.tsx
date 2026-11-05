'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, ScrollText, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { getRange, flameLevels, DayRecords } from '@/lib/storage';
import { api } from '@/lib/api-client';
import { addDays, dayIndex, dayNameHe, parseLocalDate, weekDates, weekStart } from '@/lib/dates';
import { feelingLabel } from '@/lib/mincha';
import type { WeeklyScroll } from '@/lib/types';
import Menorah from '@/components/menorah/Menorah';
import ShareSheet from '@/components/share/ShareSheet';
import { SacredText } from '@/components/moments/shared';
import { useKavana } from './KavanaContext';
import { hebrewDate } from './DateLine';

const EMPTY: DayRecords = { prayers: [], minchas: [], journals: [], offloads: [] };

/** "The book": every week is a menorah; every candle opens its day. */
export default function BookView({ initialDate }: { initialDate: string }) {
    const { profile, today, todayIndex, records: liveRecords, scrolls, refresh } = useKavana();
    const [week, setWeek] = useState(() => weekStart(initialDate));
    const [selected, setSelected] = useState(initialDate);
    const [records, setRecords] = useState<DayRecords>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [writingScroll, setWritingScroll] = useState(false);
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        setWeek(weekStart(initialDate));
        setSelected(initialDate);
    }, [initialDate]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getRange(week, addDays(week, 6)).then((r) => {
            if (!cancelled) {
                setRecords(r);
                setLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [week, liveRecords]);

    const thisWeek = weekStart(today);
    const isCurrent = week === thisWeek;
    const litThrough = isCurrent ? todayIndex : week < thisWeek ? 6 : -1;
    const levels = useMemo(() => {
        const byDate = flameLevels(records);
        return weekDates(week).map((d) => byDate[d] || 0);
    }, [records, week]);

    const day = useMemo(
        () => ({
            prayers: records.prayers.filter((p) => p.date === selected),
            minchas: records.minchas.filter((m) => m.date === selected),
            journal: records.journals.find((j) => j.date === selected) || null,
            offloads: records.offloads.filter((o) => o.date === selected),
        }),
        [records, selected],
    );
    const prayer = day.prayers[day.prayers.length - 1] || null;
    const scroll: WeeklyScroll | undefined = scrolls.find((s) => s.week_start === week);
    const canWriteScroll = !scroll && (week === addDays(thisWeek, -7) || (isCurrent && todayIndex >= 5));
    const empty = !prayer && !day.minchas.length && !day.journal && !day.offloads.length;

    const writeScroll = async () => {
        setWritingScroll(true);
        try {
            await api('/api/scroll', { date: today, weekStart: week });
            await refresh();
        } catch {
            toast.error('לא הצלחנו לכתוב את המגילה. נסו שוב בעוד רגע.');
        } finally {
            setWritingScroll(false);
        }
    };

    const weekLabel = `${parseLocalDate(week).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })} – ${parseLocalDate(addDays(week, 6)).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })}`;

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold">הספר</h1>
                <p className="text-text-secondary">כל שבוע הוא מנורה. כל נר הוא יום.</p>
            </div>

            <div className="sacred-card space-y-3">
                <div className="flex items-center justify-between">
                    <button className="btn-quiet !p-2" onClick={() => { setWeek(addDays(week, -7)); setSelected(addDays(week, -1)); }} aria-label="השבוע הקודם">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <p className="text-sm font-medium">{isCurrent ? 'השבוע הזה' : weekLabel}</p>
                    <button
                        className="btn-quiet !p-2 disabled:invisible"
                        disabled={isCurrent}
                        onClick={() => { const n = addDays(week, 7); setWeek(n); setSelected(n === thisWeek ? today : addDays(n, 6)); }}
                        aria-label="השבוע הבא"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex justify-center">
                    <Menorah
                        litThrough={litThrough}
                        todayIndex={isCurrent ? todayIndex : null}
                        levels={levels}
                        selected={dayIndex(selected)}
                        onSelect={(d) => d <= litThrough && setSelected(addDays(week, d))}
                        showDayNames
                        className="w-56"
                    />
                </div>
            </div>

            {scroll && (
                <article className="sacred-card space-y-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="label">המגילה השבועית</p>
                            <h2 className="text-2xl font-bold">{scroll.content.title || 'המגילה'}</h2>
                        </div>
                        <ScrollText className="w-6 h-6 text-flame shrink-0" />
                    </div>
                    <SacredText text={scroll.content.light} className="!text-lg" />
                    {scroll.content.shadow.length > 0 && (
                        <div className="space-y-2">
                            <p className="label">הצל: דפוסים בתהליך</p>
                            <ul className="space-y-2 list-disc pr-5 text-text-primary leading-relaxed">
                                {scroll.content.shadow.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                    {scroll.content.focus && (
                        <div className="border-t border-accent-border/25 pt-4 space-y-1">
                            <p className="label">נקודת עבודה לשבוע הבא</p>
                            <p className="text-lg text-accent-active leading-relaxed">{scroll.content.focus}</p>
                        </div>
                    )}
                    <button className="btn-quiet !px-0 flex items-center gap-2 text-accent-active font-medium" onClick={() => setSharing(true)}>
                        <Share2 className="w-4 h-4" />
                        משפט השבוע
                    </button>
                </article>
            )}

            {canWriteScroll && (
                <button className="btn-quiet w-full border border-dashed border-accent-border/50 flex items-center justify-center gap-2" onClick={writeScroll} disabled={writingScroll}>
                    {writingScroll ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScrollText className="w-4 h-4" />}
                    לכתוב את המגילה של השבוע
                </button>
            )}

            <section className="space-y-4">
                <h2 className="text-xl font-bold">
                    {dayNameHe(selected)} · {hebrewDate(selected)}
                </h2>

                {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-text-muted" />
                ) : empty ? (
                    <p className="text-text-secondary">{selected === today ? 'היום עוד לפניך.' : 'יום שקט. הנר דלק בכל זאת.'}</p>
                ) : (
                    <>
                        {prayer && (
                            <div className="sacred-card space-y-4">
                                <p className="label">שחרית</p>
                                <SacredText text={prayer.content} className="!text-lg" />
                                {prayer.action_line && <p className="text-accent-active">{prayer.action_line}</p>}
                            </div>
                        )}
                        {day.minchas.length > 0 && (
                            <div className="sacred-card space-y-1">
                                <p className="label">מנחה</p>
                                <p>
                                    {day.minchas.map((m) => (m.feeling ? feelingLabel(m.feeling, profile.gender) : 'עצירה')).join(' · ')}
                                </p>
                            </div>
                        )}
                        {day.journal && (
                            <div className="sacred-card space-y-4">
                                <p className="label">ערבית</p>
                                {day.journal.declaration && <SacredText text={day.journal.declaration} className="!text-lg" />}
                                <dl className="grid gap-2 text-sm border-t border-accent-border/25 pt-4">
                                    <div><dt className="label">הצלחתי</dt><dd>{day.journal.success}</dd></div>
                                    <div><dt className="label">יש בי</dt><dd>{day.journal.capability}</dd></div>
                                    <div><dt className="label">הכרת הטוב</dt><dd>{day.journal.gratitude}</dd></div>
                                </dl>
                            </div>
                        )}
                        {day.offloads.length > 0 && (
                            <details className="sacred-card">
                                <summary className="label cursor-pointer">פריקות ({day.offloads.length})</summary>
                                <div className="space-y-4 pt-4">
                                    {day.offloads.map((o) => (
                                        <div key={o.id} className="space-y-2">
                                            <p className="whitespace-pre-wrap">{o.content}</p>
                                            {o.ai_response && <p className="text-text-secondary font-serif">{o.ai_response}</p>}
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}
                    </>
                )}
            </section>

            <AnimatePresence>
                {sharing && scroll && (
                    <ShareSheet
                        lines={scroll.content.share_lines}
                        preferred={profile.share_style}
                        kicker={`שבת · המנורה שלמה`}
                        litThrough={6}
                        levels={levels}
                        variant="shabbat"
                        moment="scroll"
                        onClose={() => setSharing(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
