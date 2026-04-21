"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, BookOpen, BarChart3, User } from 'lucide-react';
import MorningTab from './MorningTab';
import JournalForm from '../journal/JournalForm';
import ProfileTab from './ProfileTab';
import InsightsTab from './InsightsTab';
import Menorah from './Menorah';
import PrayerBookTab from './PrayerBookTab';

// Tabs definition - 5 tabs
const TABS = [
    { id: 'morning', label: 'בוקר', icon: Sun },
    { id: 'evening', label: 'ערב', icon: Moon },
    { id: 'prayerbook', label: 'הספר', icon: BookOpen },
    { id: 'insights', label: 'תובנות', icon: BarChart3 },
    { id: 'profile', label: 'פרופיל', icon: User },
];

export default function DashboardLayout() {
    const [activeTab, setActiveTab] = useState('morning');
    const [isIgniting, setIsIgniting] = useState(false);

    // Theme is now managed by ThemeProvider - removed the old useEffect

    // Calculate Day of Week (Sun=1...Sat=7)
    const dayOfWeek = new Date().getDay() + 1;

    return (
        <div className="min-h-screen min-h-[100dvh] pb-24 transition-colors duration-500 relative">
            {/* Background Gradient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-60 bg-gradient-to-b from-primary/5 to-transparent" />
            </div>

            {/* Main Content Area */}
            <main className="container-app relative z-10">
                {/* Visual Anchor: Menorah */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-6 pb-4 flex justify-center"
                >
                    <Menorah activeDay={dayOfWeek} isIgniting={isIgniting} className="w-20 sm:w-24" />
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
                        {activeTab === 'profile' && <ProfileTab profile={require('@/lib/storage').getProfile() || {}} />}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
                <div className="glass-strong mx-3 mb-3 rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex justify-around items-center max-w-md mx-auto h-16">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    whileTap={{ scale: 0.92 }}
                                    className={`flex flex-col items-center justify-center w-full h-full relative transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    {/* Active Indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute -top-0.5 w-10 h-1 rounded-full bg-gradient-to-r from-primary to-purple-500"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}

                                    {/* Icon with background when active */}
                                    <motion.div
                                        animate={{
                                            backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                                        }}
                                        className="p-2 rounded-xl mb-0.5"
                                    >
                                        <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                                    </motion.div>

                                    <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? 'font-bold' : ''
                                        }`}>
                                        {tab.label}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
}
