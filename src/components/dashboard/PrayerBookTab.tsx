"use client";

import React, { useState, useEffect } from 'react';
import { getPrayers, getJournalEntries, PrayerEntry, JournalEntry, getProfile } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Copy, Share2, X, Sparkles, Moon, Filter, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { getZadokDate } from '@/lib/calendar/zadokCalendar';

type ViewMode = 'all' | 'prayers' | 'journal' | 'favorites';
type TimelineItem =
    | { type: 'prayer'; data: PrayerEntry; dateObj: Date; zadok: string }
    | { type: 'journal'; data: JournalEntry; dateObj: Date; zadok: string };

export default function PrayerBookTab() {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [selectedPrayer, setSelectedPrayer] = useState<PrayerEntry | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('all');

    useEffect(() => {
        async function loadItems() {
            const prayersData = await getPrayers();
            const journalData = await getJournalEntries();

            const prayers = prayersData.map(p => ({ 
                type: 'prayer' as const, 
                data: p, 
                dateObj: new Date(p.date),
                zadok: getZadokDate(new Date(p.date)).displayText
            }));
            const journal = journalData.map(j => ({ 
                type: 'journal' as const, 
                data: j, 
                dateObj: new Date(j.date),
                zadok: getZadokDate(new Date(j.date)).displayText
            }));
            
            const combined = [...prayers, ...journal].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
            setItems(combined);

            const storedFavorites = localStorage.getItem('kavana_favorites');
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        }
        loadItems();
    }, []);

    const toggleFavorite = (prayerId: string) => {
        const newFavorites = favorites.includes(prayerId)
            ? favorites.filter(id => id !== prayerId)
            : [...favorites, prayerId];

        setFavorites(newFavorites);
        localStorage.setItem('kavana_favorites', JSON.stringify(newFavorites));
        toast.success(newFavorites.includes(prayerId) ? 'נוסף למועדפים ❤️' : 'הוסר מהמועדפים');
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('he-IL', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const filteredItems = items.filter(item => {
        if (viewMode === 'all') return true;
        if (viewMode === 'prayers') return item.type === 'prayer';
        if (viewMode === 'journal') return item.type === 'journal';
        if (viewMode === 'favorites') return item.type === 'prayer' && favorites.includes(item.data.id);
        return true;
    });

    if (items.length === 0) {
        return (
            <div className="text-center py-20 space-y-4 animate-in fade-in">
                <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto text-text-secondary">
                    <BookOpen className="w-10 h-10 opacity-20" />
                </div>
                <h2 className="text-2xl font-bold text-sacred">הספר עדיין ריק</h2>
                <p className="text-text-secondary italic">הכוונות והאספים שלך יישמרו כאן באופן אוטומטי</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pt-4 pb-24">
            <header className="text-center space-y-1">
                <h1 className="text-4xl font-bold text-sacred">הספר שלי</h1>
                <p className="text-text-secondary italic">תיעוד המסע הרוחני שלך</p>
            </header>

            {/* Filter Tabs */}
            <div className="flex bg-black/5 p-1 rounded-2xl gap-1">
                {(['all', 'prayers', 'journal', 'favorites'] as ViewMode[]).map(mode => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === mode ? 'bg-white shadow-sm text-accent-active' : 'text-text-secondary'}`}
                    >
                        {mode === 'all' ? 'הכל' : mode === 'prayers' ? 'כוונות' : mode === 'journal' ? 'אספים' : 'מועדפים'}
                    </button>
                ))}
            </div>

            {/* Timeline List */}
            <div className="space-y-4">
                {filteredItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => item.type === 'prayer' && setSelectedPrayer(item.data)}
                        className={`sacred-card group cursor-pointer ${item.type === 'journal' ? 'bg-accent-active/5 border-accent-active/10' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-accent-active uppercase tracking-widest flex items-center gap-2">
                                    {item.type === 'prayer' ? <Sparkles className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                                    {formatDate(item.dateObj)}
                                </p>
                                <p className="text-[9px] text-text-secondary italic">{item.zadok}</p>
                            </div>
                            {item.type === 'prayer' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item.data.id); }}
                                    className="p-2 -mr-2"
                                >
                                    <Heart className={`w-5 h-5 transition-colors ${favorites.includes(item.data.id) ? 'fill-rose-500 text-rose-500' : 'text-text-secondary/30 hover:text-rose-300'}`} />
                                </button>
                            )}
                        </div>

                        {item.type === 'prayer' ? (
                            <p className="text-lg leading-relaxed text-sacred line-clamp-3">
                                {item.data.content}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-lg font-bold text-sacred">✨ {item.data.daily_success}</p>
                                {item.data.declaration && (
                                    <p className="text-sm text-text-secondary italic">"{item.data.declaration}"</p>
                                )}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Prayer Modal */}
            <AnimatePresence>
                {selectedPrayer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPrayer(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg sacred-card p-8 overflow-y-auto max-h-[85vh]">
                            <button onClick={() => setSelectedPrayer(null)} className="absolute top-4 left-4 p-2 text-text-secondary">
                                <X className="w-6 h-6" />
                            </button>
                            
                            <div className="text-center space-y-1 mb-8">
                                <p className="text-[10px] font-bold text-accent-active uppercase tracking-widest">{formatDate(new Date(selectedPrayer.date))}</p>
                                <p className="text-xs text-text-secondary italic">{getZadokDate(new Date(selectedPrayer.date)).displayText}</p>
                            </div>

                            <p className="text-xl leading-relaxed text-sacred whitespace-pre-wrap mb-8 text-center font-light">
                                {selectedPrayer.content}
                            </p>

                            <div className="flex gap-3">
                                <button onClick={() => { navigator.clipboard.writeText(selectedPrayer.content); toast.success('הועתק!'); }} className="btn-ghost flex-1 py-3 flex items-center justify-center gap-2">
                                    <Copy className="w-4 h-4" /> העתק
                                </button>
                                <button onClick={() => toggleFavorite(selectedPrayer.id)} className={`px-5 py-3 rounded-xl border flex items-center justify-center transition-colors ${favorites.includes(selectedPrayer.id) ? 'bg-rose-50 border-rose-100 text-rose-500' : 'border-border-color text-text-secondary'}`}>
                                    <Heart className={`w-5 h-5 ${favorites.includes(selectedPrayer.id) ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
