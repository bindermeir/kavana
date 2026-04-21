"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, X, Heart, Star, Zap, PenTool, Moon, Sparkles } from 'lucide-react';
import { saveJournalEntry, JournalEntry, getProfile, saveProfile } from '@/lib/storage';
import { toast } from 'sonner';

export default function JournalForm() {
    const [step, setStep] = useState(0);
    const [entry, setEntry] = useState<Partial<JournalEntry>>({
        gratitude_items: ['', '', ''],
        daily_success: '',
        capacity_used: '',
        declaration: '',
        date: new Date().toISOString()
    });
    });
    const [isSaved, setIsSaved] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [eveningReflection, setEveningReflection] = useState('');

    const updateGratitude = (index: number, value: string) => {
        const newItems = [...(entry.gratitude_items || [])];
        newItems[index] = value;
        setEntry(prev => ({ ...prev, gratitude_items: newItems }));
    };

    const handleSave = async () => {
        if (!entry.daily_success) {
            toast.error('אנא ציין לפחות הצלחה אחת היום');
            return;
        }

        setIsGenerating(true);

        const finalEntry = {
            ...entry,
            id: crypto.randomUUID(),
            user_id: 'current-user',
            date: new Date().toISOString()
        } as JournalEntry;

        // 1. Save to Journal
        saveJournalEntry(finalEntry);

        // 2. Auto-sync to CBT Bank
        const profile = getProfile();
        if (profile) {
            let updatedProfile = { ...profile };
            if (finalEntry.daily_success) {
                updatedProfile.success_bank = [...(updatedProfile.success_bank || []), finalEntry.daily_success];
            }
            if (finalEntry.capacity_used) {
                updatedProfile.personal_strengths = [...(updatedProfile.personal_strengths || []), finalEntry.capacity_used];
            }
            saveProfile(updatedProfile);
        }

        // 3. Generate Evening Reflection
        try {
            const res = await fetch('/api/generate-evening', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, journal: finalEntry })
            });
            const data = await res.json();
            if (data.reflection) {
                setEveningReflection(data.reflection);
            }
        } catch (e) {
            console.error(e);
            toast.error('לא הצלחנו לייצר סיכום אוטומטי, אבל היומן נשמר.');
        }

        setIsGenerating(false);
        setIsSaved(true);
    };

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 opacity-50"
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Moon className="w-10 h-10 text-primary" />
                    </motion.div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold font-serif gradient-text">מעבד את האסיף היומי...</h2>
                    <p className="text-sm text-text-secondary">מלקט את ההצלחות שלך לכדי סיכום לילה</p>
                </div>
            </div>
        );
    }

    if (isSaved) {
        return (
            <div className="py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-500/20"
                    >
                        <Moon className="w-8 h-8 fill-current" />
                    </motion.div>
                    <h2 className="text-2xl font-serif font-bold text-primary">היומן נשמר. לילה טוב.</h2>
                </div>

                {eveningReflection && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-card p-6 rounded-3xl border border-primary/20 shadow-xl shadow-primary/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                        <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            תפילת לילה מותאמת עבורך:
                        </h3>
                        <p className="text-lg leading-relaxed font-serif whitespace-pre-wrap text-text-primary relative z-10">
                            {eveningReflection}
                        </p>
                    </motion.div>
                )}

                <div className="text-center pt-8">
                    <button
                        onClick={() => { setIsSaved(false); setEveningReflection(''); setStep(0); setEntry({ gratitude_items: ['', '', ''] }); }}
                        className="text-text-secondary text-sm font-medium hover:text-primary transition-colors"
                    >
                        כתוב רשומה נוספת
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-4 space-y-6">
            <div className="text-center space-y-2 relative z-10">
                <div className="text-sm text-text-secondary flex items-center justify-center gap-2">
                    <Moon className="w-4 h-4" /> סיכום יום
                </div>
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
