"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPrayers, getJournalEntries, getWeeklyScrolls, saveWeeklyScroll, PrayerEntry, JournalEntry, WeeklyScroll, getProfile, UserProfile } from '@/lib/storage';
import { getZadokDate } from '@/lib/calendar/zadokCalendar';
import { ChevronRight, ChevronLeft, BookOpen, Sparkles, Moon, Star, History, Loader2, ScrollText } from 'lucide-react';
import { toast } from 'sonner';

interface DayEntry {
    type: 'daily' | 'weekly';
    date: string;
    gregorianDate: string;
    prayer?: PrayerEntry;
    journal?: JournalEntry;
    scroll?: WeeklyScroll;
    dayCount?: number;
}

export default function InsightsTab() {
    const [entries, setEntries] = useState<DayEntry[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [prayers, journals, scrolls, p] = await Promise.all([
            getPrayers(), 
            getJournalEntries(), 
            getWeeklyScrolls(),
            getProfile()
        ]);
        setProfile(p);
        
        const dateMap = new Map<string, Partial<DayEntry>>();
        
        prayers.forEach(p => {
            const d = p.date.split('T')[0];
            if (!dateMap.has(d)) dateMap.set(d, { date: d, type: 'daily' });
            dateMap.get(d)!.prayer = p;
        });

        journals.forEach(j => {
            const d = j.date.split('T')[0];
            if (!dateMap.has(d)) dateMap.set(d, { date: d, type: 'daily' });
            dateMap.get(d)!.journal = j;
        });

        const dailyEntries: DayEntry[] = Array.from(dateMap.keys())
            .sort((a, b) => b.localeCompare(a))
            .map((d, index, arr) => {
                const entry = dateMap.get(d)!;
                return {
                    ...entry,
                    type: 'daily',
                    gregorianDate: new Date(d).toLocaleDateString('en-GB', { 
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                    }),
                    dayCount: arr.length - index
                } as DayEntry;
            });

        const weeklyEntries: DayEntry[] = scrolls.map(s => ({
            type: 'weekly',
            date: s.created_at || '',
            gregorianDate: `סיכום שבועי: ${new Date(s.start_date).toLocaleDateString('he-IL')} - ${new Date(s.end_date).toLocaleDateString('he-IL')}`,
            scroll: s
        }));

        const combined = [...dailyEntries, ...weeklyEntries].sort((a, b) => b.date.localeCompare(a.date));
        setEntries(combined);
        setLoading(false);
    };

    const generateWeekly = async () => {
        if (!profile || entries.length < 3) {
            toast.error('נדרשים לפחות 3 ימי פעילות כדי לייצר סיכום שבועי');
            return;
        }

        setIsGeneratingWeekly(true);
        try {
            const prayers = await getPrayers();
            const journals = await getJournalEntries();
            
            const res = await fetch('/api/generate-weekly', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    profile, 
                    weekData: { 
                        prayers: prayers.slice(0, 7), 
                        journals: journals.slice(0, 7) 
                    } 
                })
            });

            const data = await res.json();
            if (data.scrollContent) {
                const newScroll: Omit<WeeklyScroll, 'user_id'> = {
                    id: crypto.randomUUID(),
                    content: data.scrollContent,
                    start_date: journals[Math.min(6, journals.length - 1)].date,
                    end_date: journals[0].date,
                    created_at: new Date().toISOString()
                };
                await saveWeeklyScroll(newScroll);
                toast.success('המגילה השבועית נוצרה בהצלחה!');
                fetchData();
            }
        } catch (e) {
            toast.error('אירעה שגיאה בייצור הסיכום השבועי');
        } finally {
            setIsGeneratingWeekly(false);
        }
    };

    const currentEntry = entries[currentIndex];

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-accent-active animate-spin" />
            <p className="text-sacred italic">מדפדף בדפי הספר...</p>
        </div>
    );

    return (
        <div className="space-y-8 pt-4 pb-24">
            <header className="text-center space-y-1">
                <h1 className="text-4xl font-bold text-sacred">מנחה</h1>
                <p className="text-text-secondary italic">הספר שלך - כוונות ואסיפים</p>
            </header>

            {/* Special Action: Generate Weekly */}
            {!entries.find(e => e.type === 'weekly') && entries.length >= 3 && (
                <button 
                    onClick={generateWeekly}
                    disabled={isGeneratingWeekly}
                    className="w-full py-4 bg-accent-active/10 border border-accent-active/30 rounded-2xl flex items-center justify-center gap-3 text-accent-active font-bold hover:bg-accent-active/20 transition-all"
                >
                    {isGeneratingWeekly ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScrollText className="w-5 h-5" />}
                    {isGeneratingWeekly ? 'צורב את המגילה...' : 'סנתז סיכום שבועי'}
                </button>
            )}

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                >
                    {currentEntry.type === 'daily' ? (
                        <>
                            <div className="text-center space-y-1">
                                <p className="text-accent-active font-bold text-lg">{currentEntry.gregorianDate}</p>
                                <p className="text-text-secondary text-xs uppercase tracking-widest font-bold">יום {currentEntry.dayCount} במסע</p>
                            </div>

                            {currentEntry.prayer && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-accent-active opacity-80">
                                        <Sparkles className="w-4 h-4" />
                                        <h3 className="text-xl font-bold font-serif">הכוונה</h3>
                                    </div>
                                    <div className="sacred-card p-6 space-y-4">
                                        <p className="text-[10px] text-text-secondary font-bold border-b border-border-color/10 pb-2">
                                            {getZadokDate(new Date(currentEntry.prayer.date)).displayText}
                                        </p>
                                        <p className="text-lg leading-relaxed text-sacred font-light whitespace-pre-wrap">
                                            {currentEntry.prayer.content}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {currentEntry.journal && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-accent-active opacity-80">
                                        <Moon className="w-4 h-4" />
                                        <h3 className="text-xl font-bold font-serif">אסיף</h3>
                                    </div>
                                    <div className="sacred-card p-6 space-y-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-1">
                                                <h4 className="text-[10px] font-bold text-accent-active uppercase">הכרת הטוב</h4>
                                                <p className="text-base text-sacred">{currentEntry.journal.gratitude_items}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-[10px] font-bold text-accent-active uppercase">הצלחה יומית</h4>
                                                <p className="text-base text-sacred">{currentEntry.journal.daily_success}</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-border-color/10">
                                            <h4 className="text-xs font-bold text-accent-active flex items-center gap-2 mb-2">
                                                <Star className="w-3 h-3 fill-current" /> הצהרת היש
                                            </h4>
                                            <p className="text-lg leading-relaxed text-sacred italic whitespace-pre-wrap font-light">
                                                {currentEntry.journal.declaration}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // WEEKLY SCROLL VIEW
                        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-accent-active/20 rounded-full flex items-center justify-center mx-auto text-accent-active mb-2">
                                    <ScrollText className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl font-bold text-sacred">המגילה השבועית</h2>
                                <p className="text-accent-active font-medium">{currentEntry.gregorianDate}</p>
                            </div>

                            <div className="relative p-10 bg-[#F2EDE0] border-[12px] border-double border-accent-active/20 rounded-sm shadow-2xl overflow-hidden">
                                {/* Scroll textures */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/parchment.png")' }} />
                                
                                <div className="relative z-10">
                                    <p className="text-2xl leading-relaxed text-sacred font-serif whitespace-pre-wrap italic first-letter:text-5xl first-letter:font-bold first-letter:float-right first-letter:ml-3 first-letter:mt-1">
                                        {currentEntry.scroll?.content}
                                    </p>
                                </div>
                                
                                <div className="mt-12 flex justify-center">
                                    <div className="w-24 h-px bg-accent-active/40" />
                                    <Star className="w-4 h-4 mx-4 text-accent-active/40" />
                                    <div className="w-24 h-px bg-accent-active/40" />
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            <div className="flex justify-between items-center pt-8 border-t border-border-color/20">
                <button 
                    onClick={() => setCurrentIndex(prev => Math.min(prev + 1, entries.length - 1))}
                    disabled={currentIndex === entries.length - 1}
                    className="flex items-center gap-2 text-text-secondary disabled:opacity-30 p-2"
                >
                    <ChevronRight className="w-5 h-5" /> יותר ישן
                </button>
                
                <button 
                    onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 text-text-secondary disabled:opacity-30 p-2"
                >
                    יותר חדש <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
