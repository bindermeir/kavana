"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, BookOpen, Compass, User, Loader2 } from 'lucide-react';
import MorningTab from './MorningTab';
import JournalForm from '../journal/JournalForm';
import ProfileTab from './ProfileTab';
import InsightsTab from './InsightsTab';
import Menorah from './Menorah';
import PrayerBookTab from './PrayerBookTab';
import FloatingOffloadButton from '../offload/FloatingOffloadButton';
import DateDisplay from '../ui/DateDisplay';
import { getProfile, UserProfile } from '@/lib/storage';

const TABS = [
    { id: 'morning', name: 'בוקר', icon: Sparkles, component: MorningTab },
    { id: 'evening', name: 'ערב', icon: Moon, component: JournalForm },
    { id: 'prayerbook', name: 'הספר שלי', icon: BookOpen, component: PrayerBookTab },
    { id: 'insights', name: 'תובנות', icon: Compass, component: InsightsTab },
    { id: 'profile', name: 'פרופיל', icon: User, component: ProfileTab },
];

export default function DashboardLayout() {
    const [activeTab, setActiveTab] = useState('morning');
    const [isIgniting, setIsIgniting] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const p = await getProfile();
            setProfile(p);
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

    const dayOfWeek = new Date().getDay();

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-[#E8E2D2]">
                <Loader2 className="w-10 h-10 text-accent-active animate-spin" />
                <p className="text-sacred italic font-medium">מכין את ההיכל...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-h-[100dvh] pb-24 transition-colors duration-500 relative bg-[#E8E2D2]">
            <main className="container-app relative z-10 max-w-lg mx-auto px-4">
                {/* Visual Anchor: Menorah */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-10 pb-6 flex flex-col items-center"
                >
                    <Menorah activeDay={dayOfWeek} isIgniting={isIgniting} className="w-24 sm:w-28 mb-4" />
                    <DateDisplay />
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        {activeTab === 'morning' && (
                            <MorningTab
                                onIgnite={() => setIsIgniting(true)}
                                onIgniteEnd={() => setIsIgniting(false)}
                            />
                        )}
                        {activeTab === 'evening' && <JournalForm />}
                        {activeTab === 'prayerbook' && <PrayerBookTab />}
                        {activeTab === 'insights' && <InsightsTab />}
                        {activeTab === 'profile' && profile && <ProfileTab profile={profile} />}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Floating Actions */}
            <FloatingOffloadButton />

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
                <div className="glass-strong mx-3 mb-3 rounded-2xl shadow-lg overflow-hidden border border-white/20">
                    <div className="flex justify-around items-center h-16">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-col items-center justify-center w-full h-full relative transition-colors duration-200 ${isActive ? 'text-accent-active' : 'text-text-secondary hover:text-text-primary'}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute -top-0.5 w-8 h-1 rounded-full bg-accent-active"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={`w-6 h-6 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
                                    <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                        {tab.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
}
