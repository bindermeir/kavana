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
    dynamic?: {
        [cultureName: string]: {
            dateStr: string;
            events: CultureEvent[];
        }
    };
}

import { getDynamicCultures } from '../admin';

export async function getDailyCalendarInfo(profile: UserProfile | null, date: Date = new Date()): Promise<DailyCalendarInfo> {
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

    // Dynamic Cultures from Supabase
    try {
        const dynCultures = await getDynamicCultures();
        
        dynCultures.forEach(culture => {
            // Check if user is subscribed or if it's their belief system
            const isSubscribed = subs.includes(culture.id) || subs.includes(culture.name.toLowerCase());
            const isBelief = belief.includes(culture.name.toLowerCase());
            
            if (isSubscribed || isBelief) {
                if (!info.dynamic) info.dynamic = {};
                
                // Find events matching today's date (simplified: just matching MM-DD)
                const todayStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                
                const todaysEvents = (culture.events_json || []).filter((e: any) => e.date === todayStr);
                
                info.dynamic[culture.name] = {
                    dateStr: '', // Dynamic cultures might just rely on gregorian date textually
                    events: todaysEvents.map((e: any) => ({ name: e.name, type: e.type || 'holiday' }))
                };
            }
        });
    } catch (e) {
        console.error('Failed to load dynamic cultures', e);
    }

    return info;
}
