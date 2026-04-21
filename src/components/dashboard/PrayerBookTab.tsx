"use client";

import React, { useState, useEffect } from 'react';
import { getPrayers, getJournalEntries, PrayerEntry, JournalEntry } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Copy, Share2, X, Sparkles, Moon } from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'all' | 'prayers' | 'journal' | 'favorites';
type TimelineItem =
    | { type: 'prayer'; data: PrayerEntry; dateObj: Date }
    | { type: 'journal'; data: JournalEntry; dateObj: Date };

export default function PrayerBookTab() {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [selectedPrayer, setSelectedPrayer] = useState<PrayerEntry | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('all');

    useEffect(() => {
        const prayers = getPrayers().map(p => ({ type: 'prayer' as const, data: p, dateObj: new Date(p.date) }));
        const journal = getJournalEntries().map(j => ({ type: 'journal' as const, data: j, dateObj: new Date(j.date) }));
        const combined = [...prayers, ...journal].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
        setItems(combined);

        const storedFavorites = localStorage.getItem('kavana_favorites');
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    const toggleFavorite = (prayerId: string) => {
        const newFavorites = favorites.includes(prayerId)
            ? favorites.filter(id => id !== prayerId)
            : [...favorites, prayerId];

        setFavorites(newFavorites);
        localStorage.setItem('kavana_favorites', JSON.stringify(newFavorites));

        if (newFavorites.includes(prayerId)) {
            toast.success('נוסף למועדפים ❤️');
        }
    };

    const copyPrayer = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success('הטקסט הועתק!');
    };

    const sharePrayer = async (prayer: PrayerEntry) => {
        if (navigator.share) {
            try {
                await navigator.share({ title: 'כוונה יומית', text: prayer.content });
            } catch (e) { /* cancelled */ }
        } else {
            copyPrayer(prayer.content);
        }
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

    const prayerCount = items.filter(i => i.type === 'prayer').length;
    const journalCount = items.filter(i => i.type === 'journal').length;
    const favCount = favorites.length;

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">📖</div>
                <h2 className="text-xl font-bold mb-2">הספר שלך ריק</h2>
                <p className="text-text-secondary">צור את הכוונה הראשונה שלך בטאב "בוקר"</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-20">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold">📖 הספר שלי</h1>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                <button
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${viewMode === 'all' ? 'bg-primary text-white' : 'bg-surface text-text-secondary'
                        }`}
                >
                    הכל ({items.length})
                </button>
                <button
                    onClick={() => setViewMode('prayers')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${viewMode === 'prayers' ? 'bg-orange-500 text-white' : 'bg-surface text-text-secondary'
                        }`}
                >
                    <Sparkles className="w-3 h-3" /> כוונות ({prayerCount})
                </button>
                <button
                    onClick={() => setViewMode('journal')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${viewMode === 'journal' ? 'bg-indigo-500 text-white' : 'bg-surface text-text-secondary'
                        }`}
                >
                    <Moon className="w-3 h-3" /> יומן ({journalCount})
                </button>
                <button
                    onClick={() => setViewMode('favorites')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${viewMode === 'favorites' ? 'bg-red-500 text-white' : 'bg-surface text-text-secondary'
                        }`}
                >
                    <Heart className="w-3 h-3" /> מועדפים ({favCount})
                </button>
            </div>

            {/* Timeline Grid */}
            <div className="space-y-3">
                {filteredItems.map((item, idx) => (
                    <motion.div
                        key={`${item.type}-${item.type === 'prayer' ? item.data.id : idx}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`p-4 rounded-xl border shadow-sm relative group cursor-pointer ${item.type === 'prayer'
                            ? 'bg-card border-primary/20 hover:shadow-md'
                            : 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20'
                            }`}
                        onClick={() => item.type === 'prayer' && setSelectedPrayer(item.data)}
                    >
                        {/* Favorite Button (prayers only) */}
                        {item.type === 'prayer' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(item.data.id);
                                }}
                                className="absolute top-2 left-2 z-10"
                            >
                                <Heart
                                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${favorites.includes(item.data.id)
                                        ? 'fill-red-500 text-red-500'
                                        : 'text-gray-300 hover:text-red-300'
                                        }`}
                                />
                            </button>
                        )}

                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${item.type === 'prayer' ? 'text-orange-700 bg-orange-100' : 'text-indigo-700 bg-indigo-100'
                                }`}>
                                {item.type === 'prayer' ? <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Moon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                                {formatDate(item.dateObj)}
                            </div>
                            {item.type === 'prayer' && item.data.focus_area && (
                                <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                    {item.data.focus_area}
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        {item.type === 'prayer' ? (
                            <p className="text-sm leading-relaxed line-clamp-3 font-serif">
                                {item.data.content}
                            </p>
                        ) : (
                            <div className="text-sm space-y-1">
                                <div className="font-medium text-indigo-900">✨ {item.data.daily_success}</div>
                                {item.data.declaration && (
                                    <div className="text-indigo-800/80 italic text-xs">"{item.data.declaration}"</div>
                                )}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Full Prayer Modal */}
            <AnimatePresence>
                {selectedPrayer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedPrayer(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card rounded-2xl p-5 sm:p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedPrayer(null)}
                                className="absolute top-3 left-3 sm:top-4 sm:left-4 p-1"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>

                            <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary mb-4">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                {formatDate(new Date(selectedPrayer.date))}
                                {selectedPrayer.focus_area && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                        {selectedPrayer.focus_area}
                                    </span>
                                )}
                            </div>

                            <p className="text-base sm:text-lg leading-relaxed font-serif whitespace-pre-wrap mb-6">
                                {selectedPrayer.content}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyPrayer(selectedPrayer.content)}
                                    className="flex-1 py-2 rounded-lg bg-surface text-text-secondary flex items-center justify-center gap-2 text-xs sm:text-sm font-medium hover:opacity-80 transition-colors"
                                >
                                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" /> העתק
                                </button>
                                <button
                                    onClick={() => sharePrayer(selectedPrayer)}
                                    className="flex-1 py-2 rounded-lg bg-primary text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" /> שתף
                                </button>
                                <button
                                    onClick={() => toggleFavorite(selectedPrayer.id)}
                                    className={`px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${favorites.includes(selectedPrayer.id)
                                        ? 'bg-red-100 text-red-500'
                                        : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${favorites.includes(selectedPrayer.id) ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
