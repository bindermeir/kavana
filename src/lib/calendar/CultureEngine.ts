import { UserProfile } from '../storage';
import { getZadokDate, ZadokDate } from './zadokCalendar';
const { HDate } = require('hebcal');

export interface CultureEvent {
    name: string;
    description?: string;
    type: 'holiday' | 'fast' | 'observance';
}

export interface DailyCalendarInfo {
    gregorian: {
        dateStr: string; // e.g. "24.04.2026"
        dayName: string;
    };
    hebrew?: {
        dateStr: string;
        events: CultureEvent[];
    };
    zadok?: {
        dateStr: string;
        events: CultureEvent[];
    };
    // Future: islamic, christian, etc.
}

export function getDailyCalendarInfo(profile: UserProfile | null, date: Date = new Date()): DailyCalendarInfo {
    const info: DailyCalendarInfo = {
        gregorian: {
            dateStr: date.toLocaleDateString('en-GB'), // default format
            dayName: date.toLocaleDateString('en-US', { weekday: 'long' }) // default language
        }
    };

    // By default, if no profile, we assume the original Kavana defaults (Hebrew + Zadok)
    // Or if the user has specific subscriptions, we use those.
    // Let's analyze the profile
    const belief = profile?.belief_system?.toLowerCase() || '';
    const subs = profile?.calendar_subscriptions || [];

    const isJewish = belief.includes('jewish') || belief.includes('יהוד') || belief.includes('torah') || belief.includes('תורה');
    const hasZadokSub = subs.includes('zadok') || belief.includes('zadok') || belief.includes('צדוק') || belief.includes('קומראן');
    const hasHebrewSub = subs.includes('hebrew') || isJewish;

    // Hebrew Calendar (Default for Kavana legacy users or if subscribed)
    if (hasHebrewSub || !profile) {
        const hDate = new HDate(date);
        info.hebrew = {
            dateStr: hDate.toString('h'), // Hebrew chars. Todo: Support english transliteration if lang='en'
            events: [] // We can add hebcal holiday fetching here
        };
    }

    // Zadok Calendar (Default for Kavana legacy users or if subscribed)
    if (hasZadokSub || !profile) {
        const zadokInfo = getZadokDate(date);
        const events: CultureEvent[] = [];
        if (zadokInfo.festival) {
            events.push({ name: zadokInfo.festival, type: 'holiday' });
        }
        info.zadok = {
            dateStr: zadokInfo.displayText,
            events
        };
    }

    // Adjust Gregorian language based on profile
    if (profile?.language === 'he') {
        info.gregorian.dateStr = date.toLocaleDateString('he-IL');
        info.gregorian.dayName = date.toLocaleDateString('he-IL', { weekday: 'long' });
    }

    return info;
}
