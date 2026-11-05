'use client';

import { createContext, useContext } from 'react';
import type { DayRecords } from '@/lib/storage';
import type { UserProfile, WeeklyScroll } from '@/lib/types';

export interface KavanaState {
    profile: UserProfile;
    setProfile: (p: UserProfile) => void;
    /** The user's local date, YYYY-MM-DD. */
    today: string;
    /** 0 (Sunday) ... 6 (Shabbat). */
    todayIndex: number;
    /** This week's and last week's records. */
    records: DayRecords;
    /** Moments done per date (0..3). */
    levelsByDate: Record<string, number>;
    /** This week's flame levels, Sunday first. */
    weekLevels: number[];
    scrolls: WeeklyScroll[];
    refresh: () => Promise<void>;
    openBookOn: (date: string) => void;
}

export const KavanaContext = createContext<KavanaState | null>(null);

export function useKavana(): KavanaState {
    const ctx = useContext(KavanaContext);
    if (!ctx) throw new Error('useKavana must be used inside the app shell');
    return ctx;
}
