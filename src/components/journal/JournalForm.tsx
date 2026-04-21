"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, X, Heart, Star, Zap, PenTool } from 'lucide-react';
import { saveJournalEntry, JournalEntry } from '@/lib/storage';

export default function JournalForm() {
    const [step, setStep] = useState(0);
    const [entry, setEntry] = useState<Partial<JournalEntry>>({
        gratitude_items: ['', '', ''],
        daily_success: '',
        capacity_used: '',
        declaration: '',
        date: new Date().toISOString()
    });
    const [isSaved, setIsSaved] = useState(false);

    const updateGratitude = (index: number, value: string) => {
        const newItems = [...(entry.gratitude_items || [])];
        newItems[index] = value;
        setEntry(prev => ({ ...prev, gratitude_items: newItems }));
    };

    const handleSave = () => {
        if (!entry.daily_success) return; // Basic validation
        const finalEntry = {
            ...entry,
            id: crypto.randomUUID(),
            user_id: 'current-user', // MVP placeholder
            date: new Date().toISOString()
        } as JournalEntry;

        saveJournalEntry(finalEntry);
        setIsSaved(true);
    };

    if (isSaved) {
        return (
            <div className="text-center py-20 space-y-4">
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600"
                >
                    <Heart className="w-10 h-10 fill-current" />
                </motion.div>
                <h2 className="text-2xl font-serif font-bold">היומן נשמר בהצלחה</h2>
                <p className="text-text-secondary">לילה טוב וחלומות פז.</p>
                <button
                    onClick={() => { setIsSaved(false); setStep(0); setEntry({ gratitude_items: ['', '', ''] }); }}
                    className="text-primary font-medium hover:underline"
                >
                    כתוב יומן חדש
                </button>
            </div>
        );
    }

    return (
        <div className="pt-4 space-y-6">
            <div className="text-center space-y-2">
                <div className="text-sm text-text-secondary">סיכום יום</div>
                <h1 className="text-3xl font-serif font-bold text-primary">האסיף היומי</h1>
            </div>

            <div className="space-y-6">
                {/* 1. Gratitude */}
                <Card icon={Heart} title="הודיה: מה עבד היום?" color="text-rose-500" bg="bg-rose-50">
                    <div className="space-y-3">
                        {[0, 1, 2].map(i => (
                            <input
                                key={i}
                                type="text"
                                placeholder={`הדבר ה-${i + 1} שעבד...`}
                                value={entry.gratitude_items?.[i] || ''}
                                onChange={e => updateGratitude(i, e.target.value)}
                                className="w-full p-3 rounded-lg bg-card border border-gray-100 focus:ring-2 focus:ring-rose-200 outline-none transition-all placeholder:text-gray-300"
                            />
                        ))}
                    </div>
                </Card>

                {/* 2. Success */}
                <Card icon={Star} title="הצלחה קונקרטית אחת" color="text-amber-500" bg="bg-amber-50">
                    <textarea
                        placeholder="הצלחתי ל..."
                        value={entry.daily_success || ''}
                        onChange={e => setEntry(prev => ({ ...prev, daily_success: e.target.value }))}
                        className="w-full p-3 rounded-lg bg-card border border-gray-100 focus:ring-2 focus:ring-amber-200 outline-none transition-all h-24 resize-none placeholder:text-gray-300"
                    />
                </Card>

                {/* 3. Capacity Used */}
                <Card icon={Zap} title="איזו יכולת שלי הפעלתי?" color="text-purple-500" bg="bg-purple-50">
                    <input
                        type="text"
                        placeholder="למשל: סבלנות, יצירתיות, אומץ..."
                        value={entry.capacity_used || ''}
                        onChange={e => setEntry(prev => ({ ...prev, capacity_used: e.target.value }))}
                        className="w-full p-3 rounded-lg bg-card border border-gray-100 focus:ring-2 focus:ring-purple-200 outline-none transition-all placeholder:text-gray-300"
                    />
                </Card>

                {/* 4. Declaration */}
                <Card icon={PenTool} title="הצהרת 'יש' לסיכום" color="text-teal-500" bg="bg-teal-50">
                    <textarea
                        placeholder="אני מלא ב..."
                        value={entry.declaration || ''}
                        onChange={e => setEntry(prev => ({ ...prev, declaration: e.target.value }))}
                        className="w-full p-3 rounded-lg bg-card border border-gray-100 focus:ring-2 focus:ring-teal-200 outline-none transition-all h-20 resize-none placeholder:text-gray-300"
                    />
                </Card>

                <button
                    onClick={handleSave}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    שמור ביומן
                </button>
            </div>
        </div>
    );
}

function Card({ icon: Icon, title, children, color, bg }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-1 rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden`}
        >
            <div className={`flex items-center gap-3 p-4 pb-2 border-b border-gray-50/50 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
                <h3 className="font-bold text-text-primary">{title}</h3>
            </div>
            <div className="p-4 bg-white">
                {children}
            </div>
        </motion.div>
    );
}
