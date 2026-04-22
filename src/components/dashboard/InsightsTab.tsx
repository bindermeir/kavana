"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPrayers, getJournalEntries, PrayerEntry, JournalEntry } from '@/lib/storage';
import { getZadokDate } from '@/lib/calendar/zadokCalendar';
import { ChevronRight, ChevronLeft, BookOpen, Sparkles, Moon, Star } from 'lucide-react';

interface DayEntry {
    date: string;
    gregorianDate: string;
    prayer?: PrayerEntry;
    journal?: JournalEntry;
    dayCount: number;
}

export default function InsightsTab() {
    const [entries, setEntries] = useState<DayEntry[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [prayers, journals] = await Promise.all([getPrayers(), getJournalEntries()]);
            
            // Group by date
            const dateMap = new Map<string, Partial<DayEntry>>();
            
            // Process prayers
            prayers.forEach(p => {
                const d = p.date.split('T')[0];
                if (!dateMap.has(d)) dateMap.set(d, { date: d });
                dateMap.get(d)!.prayer = p;
            });

            // Process journals
            journals.forEach(j => {
                const d = j.date.split('T')[0];
                if (!dateMap.has(d)) dateMap.set(d, { date: d });
                dateMap.get(d)!.journal = j;
            });

            // Sort and add gregorian formatting and day count
            const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));
            const finalEntries = sortedDates.map((d, index) => {
                const entry = dateMap.get(d)!;
                const dateObj = new Date(d);
                return {
                    ...entry,
                    gregorianDate: dateObj.toLocaleDateString('en-GB', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                    }),
                    dayCount: sortedDates.length - index
                } as DayEntry;
            });

            setEntries(finalEntries);
            setLoading(false);
        };
        fetchData();
    }, []);

    const currentEntry = entries[currentIndex];

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-accent-active">
                <BookOpen className="w-8 h-8" />
            </motion.div>
        </div>
    );

    if (entries.length === 0) return (
        <div className="text-center py-20 space-y-4">
            <BookOpen className="w-12 h-12 mx-auto text-text-secondary opacity-20" />
            <h2 className="text-2xl font-bold text-sacred">הספר עדיין ריק</h2>
            <p className="text-text-secondary italic">הכוונות והאספים שלך יישמרו כאן באופן אוטומטי</p>
        </div>
    );

    return (
        <div className="space-y-8 pt-4 pb-24">
            <header className="text-center space-y-1">
                <h1 className="text-4xl font-bold text-sacred">מנחה</h1>
                <p className="text-text-secondary italic">הספר שלך - כוונות ואסיפים</p>
            </header>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentEntry.date}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                >
                    {/* Date and Day Count */}
                    <div className="text-center space-y-1">
                        <p className="text-accent-active font-bold text-lg">{currentEntry.gregorianDate}</p>
                        <p className="text-text-secondary text-xs uppercase tracking-widest font-bold">יום {currentEntry.dayCount} מתוך {entries.length}</p>
                    </div>

                    {/* הכוונה Section */}
                    {currentEntry.prayer && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-accent-active">
                                <Sparkles className="w-5 h-5" />
                                <h3 className="text-2xl font-bold font-serif">הכוונה</h3>
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

                    {/* אסיף Section */}
                    {currentEntry.journal && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-accent-active">
                                <Moon className="w-5 h-5" />
                                <h3 className="text-2xl font-bold font-serif">אסיף</h3>
                            </div>
                            
                            <div className="sacred-card p-6 space-y-6">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-accent-active uppercase tracking-widest">הכרת הטוב</h4>
                                    <p className="text-lg text-sacred">{currentEntry.journal.gratitude_items}</p>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-accent-active uppercase tracking-widest">הצלחה יומית</h4>
                                    <p className="text-lg text-sacred">{currentEntry.journal.daily_success}</p>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-accent-active uppercase tracking-widest">יכולת בשימוש</h4>
                                    <p className="text-lg text-sacred">{currentEntry.journal.capacity_used}</p>
                                </div>

                                <div className="pt-4 border-t border-border-color/10 space-y-2">
                                    <h4 className="text-sm font-bold text-accent-active flex items-center gap-2">
                                        <Star className="w-4 h-4 fill-current" /> הצהרת היש
                                    </h4>
                                    <p className="text-lg leading-relaxed text-sacred italic whitespace-pre-wrap">
                                        {currentEntry.journal.declaration}
                                    </p>
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
                    className="flex items-center gap-2 text-text-secondary disabled:opacity-30"
                >
                    <ChevronRight className="w-5 h-5" /> יותר ישן
                </button>
                
                <button 
                    onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 text-text-secondary disabled:opacity-30"
                >
                    יותר חדש <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
