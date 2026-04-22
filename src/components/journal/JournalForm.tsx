"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Zap, Moon, Sparkles, MessageCircle, Loader2, Save, Check } from 'lucide-react';
import { saveJournalEntry, JournalEntry, getProfile, saveTask, saveOffload, Offload, UserProfile } from '@/lib/storage';
import { toast } from 'sonner';

export default function JournalForm() {
    const [mode, setMode] = useState<'journal' | 'offload'>('journal');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [entry, setEntry] = useState<Partial<JournalEntry>>({
        gratitude_items: '',
        daily_success: '',
        capacity_used: '',
        date: new Date().toISOString().split('T')[0]
    });
    
    const [offloadContent, setOffloadContent] = useState('');
    const [offloadResponse, setOffloadResponse] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [autoDeclaration, setAutoDeclaration] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const p = await getProfile();
            setProfile(p);
        };
        fetchProfile();
    }, []);

    const handleSaveJournal = async () => {
        if (!entry.daily_success || !entry.gratitude_items) {
            toast.error('אנא מלא את כל שדות האסיף');
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Generate the automatic "Declaration of IS"
            const res = await fetch('/api/generate-evening', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, journal: entry })
            });
            const data = await res.json();
            const declaration = data.declaration || '';
            setAutoDeclaration(declaration);

            // 2. Save the full entry including the AI declaration
            const finalEntry = {
                ...entry,
                declaration,
                id: crypto.randomUUID(),
                date: new Date().toISOString().split('T')[0]
            } as JournalEntry;

            await saveJournalEntry(finalEntry);

            // 3. Update the Training Center (Tasks)
            if (finalEntry.daily_success) {
                await saveTask({
                    id: crypto.randomUUID(),
                    task_type: 'success_list',
                    content: finalEntry.daily_success,
                    completed: true,
                    date: finalEntry.date
                });
            }
            if (finalEntry.capacity_used) {
                await saveTask({
                    id: crypto.randomUUID(),
                    task_type: 'capability_list',
                    content: finalEntry.capacity_used,
                    completed: true,
                    date: finalEntry.date
                });
            }

            setIsSaved(true);
        } catch (e) {
            toast.error('אירעה שגיאה בייצור הצהרת היש');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOffload = async () => {
        if (!offloadContent.trim()) return;
        setIsProcessing(true);
        const offload: Omit<Offload, 'user_id'> = {
            id: crypto.randomUUID(),
            content: offloadContent,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        };
        setOffloadResponse("הדברים נשמעו ונרשמו בלוח הלב. עכשיו אפשר לשחרר ולהיכנס לשקט.");
        await saveOffload(offload);
        setIsProcessing(false);
    };

    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <Loader2 className="w-12 h-12 text-accent-active animate-spin" />
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-sacred">יוצר הצהרת יש...</h2>
                    <p className="text-sm text-text-secondary italic">מזקק את הצלחות היום למציאות שלמה</p>
                </div>
            </div>
        );
    }

    if (isSaved) {
        return (
            <div className="py-6 space-y-8 animate-in fade-in duration-700 max-w-md mx-auto">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-accent-active/10 rounded-full flex items-center justify-center mx-auto text-accent-active shadow-inner">
                        <Check className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-sacred">האסיף הושלם</h2>
                    <p className="text-text-secondary italic">הצהרת היש שלך ללילה זה:</p>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="sacred-card p-8 border-accent-active/20 bg-accent-active/5">
                    <h3 className="text-xs font-bold text-accent-active mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <Sparkles className="w-4 h-4" /> הצהרת היש
                    </h3>
                    <p className="text-xl leading-relaxed text-sacred italic whitespace-pre-wrap font-light text-center">
                        {autoDeclaration}
                    </p>
                </motion.div>

                <div className="space-y-4 pt-6">
                    <button onClick={() => { setIsSaved(false); setAutoDeclaration(''); setMode('journal'); }} className="btn-primary w-full py-4 text-lg">סגור לילה טוב</button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pt-2 pb-20">
            <div className="flex p-1 bg-black/5 rounded-2xl gap-1">
                <button onClick={() => setMode('journal')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'journal' ? 'bg-white shadow-sm text-accent-active' : 'text-text-secondary'}`}>אסיף יומי</button>
                <button onClick={() => setMode('offload')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'offload' ? 'bg-white shadow-sm text-accent-active' : 'text-text-secondary'}`}>פריקה</button>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'journal' ? (
                    <motion.div key="journal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                        <div className="text-center space-y-1">
                            <h1 className="text-4xl font-bold text-sacred">אסיף יומי</h1>
                            <p className="text-text-secondary italic">מלקטים את הטוב של היום</p>
                        </div>

                        <div className="space-y-6">
                            <Section icon={Heart} title="הכרת הטוב">
                                <textarea className="input w-full h-24" placeholder="מה עבד היום? מה שימח אותך?" value={entry.gratitude_items || ''} onChange={e => setEntry(prev => ({ ...prev, gratitude_items: e.target.value }))} />
                            </Section>

                            <Section icon={Star} title="הצלחה יומית">
                                <textarea className="input w-full h-24" placeholder="הצלחתי ל..." value={entry.daily_success || ''} onChange={e => setEntry(prev => ({ ...prev, daily_success: e.target.value }))} />
                            </Section>

                            <Section icon={Zap} title="יכולת בשימוש">
                                <input className="input w-full" placeholder="אילו יכולות הפעלת היום?" value={entry.capacity_used || ''} onChange={e => setEntry(prev => ({ ...prev, capacity_used: e.target.value }))} />
                            </Section>

                            <div className="pt-4">
                                <button onClick={handleSaveJournal} className="btn-primary w-full py-5 text-xl shadow-xl flex items-center justify-center gap-3">
                                    <Save className="w-6 h-6" /> סיים אסיף וצור הצהרה
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="offload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                        <div className="text-center space-y-1">
                            <h1 className="text-4xl font-bold text-sacred">פריקה רגשית</h1>
                            <p className="text-text-secondary italic">פשוט להוציא את מה שעל הלב</p>
                        </div>

                        <div className="sacred-card p-6 space-y-4">
                            <textarea className="input w-full h-64 resize-none border-none shadow-none text-xl leading-relaxed" placeholder="פשוט תכתוב הכל..." value={offloadContent} onChange={e => setOffloadContent(e.target.value)} />
                            {offloadResponse && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-accent-active/5 rounded-2xl italic text-sacred text-center">
                                    "{offloadResponse}"
                                </motion.div>
                            )}
                            <button onClick={handleOffload} disabled={!offloadContent.trim() || isProcessing} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                                <MessageCircle className="w-5 h-5" /> לפרוק עכשיו
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Section({ icon: Icon, title, children }: any) {
    return (
        <div className="sacred-card space-y-3">
            <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-accent-active" />
                <h3 className="font-bold text-sm text-sacred uppercase tracking-widest">{title}</h3>
            </div>
            {children}
        </div>
    );
}
