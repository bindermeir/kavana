import type { Moment } from './types';

/** YYYY-MM-DD in the user's local time zone (never UTC, so late evenings stay "today"). */
export function localDateStr(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD string as a local date (midday, to dodge DST edges). */
export function parseLocalDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d, 12);
}

export function addDays(s: string, n: number): string {
    const d = parseLocalDate(s);
    d.setDate(d.getDate() + n);
    return localDateStr(d);
}

/** 0 = Sunday ... 6 = Shabbat. */
export function dayIndex(s: string): number {
    return parseLocalDate(s).getDay();
}

/** The Sunday that opens the week containing this date. */
export function weekStart(s: string): string {
    return addDays(s, -dayIndex(s));
}

/** The seven dates of the week (Sunday first). */
export function weekDates(start: string): string[] {
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const DAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export function dayNameHe(s: string): string {
    const i = dayIndex(s);
    return i === 6 ? 'שבת' : `יום ${DAY_NAMES_HE[i]}`;
}

/** Which of the three daily moments fits this hour. */
export function momentForHour(hour: number): Moment {
    if (hour >= 4 && hour < 12) return 'shacharit';
    if (hour >= 12 && hour < 17) return 'mincha';
    return 'arvit';
}

/** Evening palette from 18:00 to 05:59. */
export function isEveningHour(hour: number): boolean {
    return hour >= 18 || hour < 6;
}

/** Strict YYYY-MM-DD check for values arriving from the client. */
export function isDateStr(v: unknown): v is string {
    return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(parseLocalDate(v).getTime());
}
