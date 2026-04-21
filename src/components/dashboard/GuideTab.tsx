import React, { useEffect, useState } from 'react';
import { getPrayers, getJournalEntries, PrayerEntry, JournalEntry } from '@/lib/storage';
import { Sparkles, Moon, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

type TimelineItem =
    | { type: 'prayer', data: PrayerEntry, dateObj: Date }
    | { type: 'journal', data: JournalEntry, dateObj: Date };

export default function GuideTab() {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const prayers = getPrayers().map(p => ({ type: 'prayer', data: p, dateObj: new Date(p.date) } as TimelineItem));
        const journal = getJournalEntries().map(j => ({ type: 'journal', data: j, dateObj: new Date(j.date) } as TimelineItem));

        const combined = [...prayers, ...journal].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
        setItems(combined);
        setLoading(false);
    }, []);

    if (loading) return <div className="text-center py-20 opacity-50">טוען היסטוריה...</div>;

    if (items.length === 0) {
        return (
            <div className="text-center py-20 px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">טרם התחלתם את המסע</h3>
                <p className="text-text-secondary">כאן יופיעו הכוונות והיומנים שלך.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-4 pb-20">
            <div className="px-4">
                <h1 className="text-2xl font-serif font-bold text-primary mb-1">המסע שלך</h1>
                <p className="text-sm text-text-secondary">יומן כוונות ורפלקציה</p>
            </div>

            <div className="space-y-4 px-4">
                {items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden group ${item.type === 'prayer' ? 'bg-card border-orange-100' : 'bg-indigo-50/50 border-indigo-100'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${item.type === 'prayer' ? 'text-orange-700 bg-orange-100' : 'text-indigo-700 bg-indigo-100'
                                }`}>
                                {item.type === 'prayer' ? <Sparkles className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                                {item.dateObj.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                            {item.type === 'prayer' && item.data.focus_area && item.data.focus_area !== 'general' && (
                                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100 max-w-[40%] truncate">
                                    {item.data.focus_area}
                                </div>
                            )}
                        </div>

                        {item.type === 'prayer' ? (
                            <div className="prose prose-sm font-serif whitespace-pre-wrap text-text-primary line-clamp-6 group-hover:line-clamp-none transition-all duration-300">
                                {item.data.content}
                            </div>
                        ) : (
                            <div className="text-sm text-text-primary space-y-2">
                                <div className="font-medium text-indigo-900">✨ הצלחה: {item.data.daily_success}</div>
                                <div className="text-indigo-800/80">"{item.data.declaration}"</div>
                            </div>
                        )}

                        {item.type === 'prayer' && (
                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => navigator.clipboard.writeText(item.data.content)}
                                    className="text-xs text-text-secondary flex items-center gap-1 hover:text-primary"
                                >
                                    <Copy className="w-3 h-3" /> העתק
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
