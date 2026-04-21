"use client";

import React, { useState, useEffect } from 'react';
import { getProfile, UserProfile, getPrayers, getJournalEntries, savePrayer, saveProfile } from '@/lib/storage';
import { Sparkles, RefreshCw, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import DateDisplay from '../ui/DateDisplay';
import PrayerCard from './PrayerCard';
import DailyQuoteCard from './DailyQuoteCard';

interface MorningTabProps {
    onIgnite?: () => void;
    onIgniteEnd?: () => void;
}

export default function MorningTab({ onIgnite, onIgniteEnd }: MorningTabProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [prayer, setPrayer] = useState<string | null>(null);
    const [askingIntent, setAskingIntent] = useState(false);
    const [specificIntent, setSpecificIntent] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const p = await getProfile();
            setProfile(p);
        };
        fetchProfile();
    }, []);

    const startGenerationFlow = () => {
        onIgnite?.();
        setTimeout(() => {
            setAskingIntent(true);
            onIgniteEnd?.();
        }, 1500);
    };

    const handleIntentSubmit = (skip: boolean = false) => {
        const focus = skip ? undefined : specificIntent;
        generateKavana(undefined, focus);
        setAskingIntent(false);
    };

    const generateKavana = async (feedback?: string, dailyFocus?: string) => {
        if (!profile) return;
        setLoading(true);

        try {
            const allPrayers = await getPrayers();
            const recentPrayers = allPrayers.slice(0, 3);
            const recentJournal = await getJournalEntries();
            
            const body = {
                ...profile,
                feedback,
                current_intention: dailyFocus || profile.current_goal,
                history: {
                    recentPrayers,
                    recentJournal: recentJournal.slice(0, 3)
                }
            };

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (data.prayer) {
                setPrayer(data.prayer);
                await savePrayer({
                    id: crypto.randomUUID(),
                    content: data.prayer,
                    date: new Date().toISOString(),
                    style_used: 'adaptive',
                    focus_area: dailyFocus || 'general'
                });

            } else {
                toast.error('התקבלה שגיאה בייצור הכוונה');
            }
        } catch (e) {
            toast.error('שגיאת תקשורת עם השרת');
        } finally {
            setLoading(false);
            onIgniteEnd?.();
        }
    };

    if (!profile) return null;

    const firstName = profile.name?.split(' ')[0] || 'חבר';
    const quote = prayer ? prayer.split('\n')[0].replace(/[.,]/g, '') : "";

    return (
        <div className="space-y-10 pt-4 pb-12">
            <header className="text-center space-y-1">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em]">בוקר טוב</p>
                <h1 className="text-4xl font-bold text-sacred">{firstName}</h1>
                <DateDisplay />
            </header>

            <AnimatePresence mode="wait">
                {!prayer ? (
                    <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        {!askingIntent ? (
                            <div className="sacred-card p-10 text-center space-y-8">
                                <p className="text-xl text-text-secondary italic">האם נתחבר לכוונה היומית?</p>
                                <button
                                    onClick={startGenerationFlow}
                                    disabled={loading}
                                    className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                                    {loading ? 'מתחבר לתדר...' : 'הצת את האור'}
                                </button>
                            </div>
                        ) : (
                            <div className="sacred-card p-8 space-y-6">
                                <div className="text-center space-y-1">
                                    <h3 className="text-2xl font-bold text-sacred">מיקוד יומי</h3>
                                    <p className="text-sm text-text-secondary italic">מה תרצה לכוון במיוחד להיום?</p>
                                </div>
                                <textarea
                                    className="input w-full h-32 resize-none text-xl leading-relaxed"
                                    placeholder="למשל: פגישה חשובה, הודיה, או פשוט שקט..."
                                    value={specificIntent}
                                    onChange={(e) => setSpecificIntent(e.target.value)}
                                    autoFocus
                                />
                                <div className="space-y-3">
                                    <button onClick={() => handleIntentSubmit(false)} disabled={!specificIntent.trim() || loading} className="btn-primary w-full py-4 text-lg">צור כוונה מדויקת</button>
                                    <button onClick={() => handleIntentSubmit(true)} className="btn-ghost w-full">דלג וצור כוונה כללית</button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="prayer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                        <div className="transform scale-[0.85] -my-12">
                            <DailyQuoteCard quote={quote} />
                        </div>
                        <div className="flex justify-center gap-4 -mt-4 mb-8">
                            <button onClick={() => toast.info('הכרטיס מוכן לשיתוף')} className="p-3 bg-white shadow-md rounded-full text-accent-active hover:scale-110 transition-transform">
                                <Download className="w-5 h-5" />
                            </button>
                            <button onClick={() => setPrayer(null)} className="p-3 bg-white shadow-md rounded-full text-text-secondary hover:scale-110 transition-transform">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="px-2">
                             <h3 className="text-xs font-bold text-accent-active uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4" /> הכוונה המלאה
                            </h3>
                            <PrayerCard 
                                content={prayer} 
                                onFeedback={(f) => generateKavana(f, specificIntent)} 
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
