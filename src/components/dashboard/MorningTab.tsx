"use client";

import React, { useState, useEffect } from 'react';
import { getProfile, UserProfile } from '@/lib/storage';
import { Sparkles, Share2, Copy, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import DateDisplay from './DateDisplay';
import PrayerCard from './PrayerCard';

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
        const p = getProfile();
        setProfile(p);
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

        if (feedback) {
            const updatedProfile = {
                ...profile,
                custom_instructions: [...(profile.custom_instructions || []), feedback]
            };
            setProfile(updatedProfile);
            const { saveProfile } = require('@/lib/storage');
            saveProfile(updatedProfile);
        }

        try {
            const { getPrayers, getJournalEntries } = require('@/lib/storage');
            const allPrayers = getPrayers();
            const recentPrayers = allPrayers.slice(0, 3);
            const recentJournal = getJournalEntries().slice(0, 3);
            
            let favoritePrayers = [];
            const storedFavorites = localStorage.getItem('kavana_favorites');
            if (storedFavorites) {
                const favoriteIds = JSON.parse(storedFavorites);
                favoritePrayers = allPrayers.filter(p => favoriteIds.includes(p.id)).slice(0, 2); // Send max 2 golden examples
            }

            const body = {
                ...profile,
                feedback,
                current_intention: dailyFocus || profile.current_intention,
                history: {
                    recentPrayers,
                    recentJournal,
                    favoritePrayers
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
                const { savePrayer } = require('@/lib/storage');
                savePrayer({
                    id: crypto.randomUUID(),
                    user_id: profile.id,
                    content: data.prayer,
                    date: new Date().toISOString(),
                    style_used: 'adaptive',
                    focus_area: dailyFocus || 'general',
                    shadow_snapshot: profile.shadow_blocker,
                    emotional_snapshot: profile.emotional_state_focus
                });

            } else if (data.error) {
                console.error('API Error:', data.error);
                toast.error(`שגיאה: ${data.error}`);
            } else {
                toast.error('התקבלה תשובה ריקה מהשרת');
            }
        } catch (e) {
            console.error(e);
            toast.error('שגיאת תקשורת עם השרת');
        } finally {
            setLoading(false);
            onIgniteEnd?.();
        }
    };

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
                <span className="text-text-secondary text-sm">טוען פרופיל...</span>
            </div>
        );
    }

    const firstName = profile.name?.split(' ')[0] || 'חבר';
    const dayName = new Date().toLocaleDateString('he-IL', { weekday: 'long' });

    return (
        <div className="space-y-6 pt-2">
            {/* Greeting Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2"
            >
                <p className="text-sm text-text-secondary">בוקר טוב</p>
                <h1 className="text-4xl font-bold gradient-text">{firstName}</h1>
                <DateDisplay />
            </motion.div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {!prayer ? (
                    <motion.div
                        key="pre-prayer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="px-2"
                    >
                        {!askingIntent ? (
                            /* Initial State - Start Button */
                            <div className="card-elevated p-6 text-center space-y-6">
                                <div className="space-y-2">
                                    <p className="text-lg text-text-primary">
                                        היום הוא יום {dayName}
                                    </p>
                                    <p className="text-text-secondary">
                                        האם נתחבר לכוונה היומית?
                                    </p>
                                </div>

                                <motion.button
                                    onClick={startGenerationFlow}
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-lg shadow-primary/25 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-6 h-6" />
                                    )}
                                    {loading ? 'מתחבר לתדר...' : 'התחל'}
                                </motion.button>
                            </div>
                        ) : (
                            /* Intent Input State */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="card-elevated p-6 space-y-5"
                            >
                                <div className="text-center space-y-1">
                                    <h3 className="text-xl font-bold text-text-primary">מיקוד יומי</h3>
                                    <p className="text-sm text-text-secondary">
                                        האם תרצה לכוון משהו מיוחד להיום?
                                    </p>
                                </div>

                                <textarea
                                    className="input w-full h-28 resize-none text-right"
                                    placeholder="למשל: יש לי פגישה חשובה, אני מרגיש עייף, אני רוצה להודות על..."
                                    value={specificIntent}
                                    onChange={(e) => setSpecificIntent(e.target.value)}
                                    autoFocus
                                />

                                <div className="space-y-3">
                                    <motion.button
                                        onClick={() => handleIntentSubmit(false)}
                                        disabled={!specificIntent.trim() || loading}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                        ) : (
                                            'צור כוונה מדויקת'
                                        )}
                                    </motion.button>
                                    <button
                                        onClick={() => handleIntentSubmit(true)}
                                        disabled={loading}
                                        className="btn-ghost w-full text-sm"
                                    >
                                        דלג וצור כוונה רגילה
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    /* Prayer Display */
                    <motion.div
                        key="prayer"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-2"
                    >
                        <div className="flex justify-between items-center mb-4 px-2">
                             <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                הכוונה שלך להיום
                            </h3>
                            <button
                                onClick={() => {
                                    setPrayer(null);
                                    setAskingIntent(false);
                                    setSpecificIntent('');
                                }}
                                className="p-2 rounded-xl bg-surface-bg text-text-secondary flex items-center justify-center text-sm font-semibold hover:bg-border-muted transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                        <PrayerCard 
                            content={prayer} 
                            onFeedback={(feedback) => generateKavana(feedback, specificIntent)} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
