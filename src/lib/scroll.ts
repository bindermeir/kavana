import type { ScrollTiming, WeeklyScroll } from './types';
import { addDays, dayIndex, weekStart } from './dates';

/**
 * Which week's scroll is due right now, if any.
 * The scroll belongs to the complete menorah, at the moment the user chose:
 * Friday before Shabbat, on Shabbat, or after Shabbat ends.
 * A missed scroll can still be opened on Sunday or Monday of the next week.
 */
export function dueScrollWeek(timing: ScrollTiming, today: string, hour: number, existing: WeeklyScroll[]): string | null {
    const has = (w: string) => existing.some((s) => s.week_start === w);
    const d = dayIndex(today);
    const thisWeek = weekStart(today);

    const ready =
        (timing === 'friday' && d >= 5) ||
        (timing === 'shabbat' && d === 6) ||
        (timing === 'motzash' && d === 6 && hour >= 19);
    if (ready && !has(thisWeek)) return thisWeek;

    const lastWeek = addDays(thisWeek, -7);
    if (d <= 1 && !has(lastWeek)) return lastWeek;
    return null;
}
