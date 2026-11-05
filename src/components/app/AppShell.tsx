'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2, Sparkles, Star, UserRound } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getProfile, getRange, getScrolls, flameLevels, DayRecords } from '@/lib/storage';
import { addDays, dayIndex, localDateStr, weekDates, weekStart } from '@/lib/dates';
import type { UserProfile, WeeklyScroll } from '@/lib/types';
import Menorah from '@/components/menorah/Menorah';
import MenorahSecret from '@/components/menorah/MenorahSecret';
import OffloadButton from '@/components/offload/OffloadButton';
import { KavanaContext, KavanaState } from './KavanaContext';
import DateLine from './DateLine';
import TodayView from './TodayView';
import BookView from './BookView';
import BankView from './BankView';
import ProfileView from './ProfileView';

type Tab = 'today' | 'book' | 'bank' | 'me';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'today', label: 'היום', icon: Sparkles },
    { id: 'book', label: 'הספר', icon: BookOpen },
    { id: 'bank', label: 'יש בי', icon: Star },
    { id: 'me', label: 'אני', icon: UserRound },
];

const EMPTY: DayRecords = { prayers: [], minchas: [], journals: [], offloads: [] };

export default function AppShell() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [records, setRecords] = useState<DayRecords>(EMPTY);
    const [scrolls, setScrolls] = useState<WeeklyScroll[]>([]);
    const [tab, setTab] = useState<Tab>('today');
    const [bookDate, setBookDate] = useState<string | null>(null);
    const [secret, setSecret] = useState(false);
    const [today, setToday] = useState(() => localDateStr());

    // Roll over at midnight without a reload.
    useEffect(() => {
        const t = setInterval(() => setToday(localDateStr()), 60_000);
        return () => clearInterval(t);
    }, []);

    const thisWeek = weekStart(today);

    const refresh = useCallback(async () => {
        const [r, s] = await Promise.all([getRange(addDays(thisWeek, -7), addDays(thisWeek, 6)), getScrolls()]);
        setRecords(r);
        setScrolls(s);
    }, [thisWeek]);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/login');
            return;
        }
        getProfile().then((p) => {
            if (!p || !p.onboarding_completed) {
                router.replace('/onboarding');
                return;
            }
            setProfile(p);
            refresh();
        });
    }, [user, loading, router, refresh]);

    const levelsByDate = useMemo(() => flameLevels(records), [records]);
    const weekLevels = useMemo(() => weekDates(thisWeek).map((d) => levelsByDate[d] || 0), [thisWeek, levelsByDate]);
    const todayIndex = dayIndex(today);

    const openBookOn = useCallback((date: string) => {
        setBookDate(date);
        setTab('book');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    if (!profile) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-accent-active animate-spin" />
                <p className="text-sacred text-text-secondary">מדליקים את הנר...</p>
            </div>
        );
    }

    const ctx: KavanaState = {
        profile,
        setProfile,
        today,
        todayIndex,
        records,
        levelsByDate,
        weekLevels,
        scrolls,
        refresh,
        openBookOn,
    };

    return (
        <KavanaContext.Provider value={ctx}>
            <div className="min-h-dvh pb-28">
                <header className="max-w-lg mx-auto px-5 pt-5 flex flex-col items-center gap-2">
                    <Menorah
                        litThrough={todayIndex}
                        todayIndex={todayIndex}
                        levels={weekLevels}
                        selected={tab === 'book' && bookDate ? dayIndex(bookDate) : null}
                        onSelect={(d) => d <= todayIndex && openBookOn(addDays(thisWeek, d))}
                        onLongPress={() => setSecret(true)}
                        className="w-36"
                    />
                    <DateLine date={today} zadok={profile.calendar_subscriptions.includes('zadok')} />
                </header>

                <main className="max-w-lg mx-auto px-5 pt-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {tab === 'today' && <TodayView />}
                            {tab === 'book' && <BookView initialDate={bookDate || today} />}
                            {tab === 'bank' && <BankView />}
                            {tab === 'me' && <ProfileView />}
                        </motion.div>
                    </AnimatePresence>
                </main>

                <OffloadButton />

                <nav className="fixed bottom-0 inset-x-0 z-30 bg-app-bg/95 backdrop-blur border-t border-accent-border/40">
                    <div className="max-w-lg mx-auto px-4 safe-bottom">
                        <div className="grid grid-cols-4">
                            {TABS.map(({ id, label, icon: Icon }) => {
                                const active = tab === id;
                                return (
                                    <button
                                        key={id}
                                        onClick={() => {
                                            setTab(id);
                                            if (id === 'book') setBookDate(null);
                                        }}
                                        className={`flex flex-col items-center gap-1 pt-3 pb-2 transition-colors ${active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
                                        aria-current={active ? 'page' : undefined}
                                    >
                                        <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />
                                        <span className={`text-[11px] ${active ? 'font-bold' : ''}`}>{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                <AnimatePresence>{secret && <MenorahSecret onClose={() => setSecret(false)} />}</AnimatePresence>
            </div>
        </KavanaContext.Provider>
    );
}
