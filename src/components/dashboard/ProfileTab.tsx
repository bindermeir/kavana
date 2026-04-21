"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/storage';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Bell, BellOff, LogIn, LogOut, Cloud, CloudOff, Loader2, Edit3, Trash2, Sparkles, Sun, Moon, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { migrateLocalStorageToCloud } from '@/lib/cloud-storage';
import AuthForm from '@/components/auth/AuthForm';

export default function ProfileTab({ profile }: { profile?: UserProfile }) {
    const { isSupported, notificationPermission, requestNotificationPermission } = useServiceWorker();
    const { user, loading: authLoading, signOut } = useAuth();
    const { mode, setMode, isDark } = useTheme();
    const [showAuthForm, setShowAuthForm] = useState(false);
    const [syncing, setSyncing] = useState(false);

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
                <span className="text-text-secondary text-sm">טוען פרופיל...</span>
            </div>
        );
    }

    const handleEnableNotifications = async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            toast.success('התראות הופעלו! תקבלו תזכורות בוקר וערב.');
        } else {
            toast.error('לא ניתן להפעיל התראות. בדוק את הגדרות הדפדפן.');
        }
    };

    const handleSyncToCloud = async () => {
        if (!user || !profile) return;
        setSyncing(true);
        try {
            const result = await migrateLocalStorageToCloud();
            if (result.success) {
                toast.success(`סונכרן! פרופיל: ${result.migrated.profile ? '✓' : '-'}, ${result.migrated.prayers} תפילות, ${result.migrated.journal} יומנים`);
            } else {
                toast.error('שגיאה בסנכרון');
            }
        } catch (e) {
            toast.error('שגיאה בסנכרון');
        }
        setSyncing(false);
    };

    const handleLogout = async () => {
        await signOut();
        toast.success('התנתקת בהצלחה');
    };

    // Show auth form modal
    if (showAuthForm && !user) {
        return (
            <div className="pb-20">
                <button
                    onClick={() => setShowAuthForm(false)}
                    className="mb-4 text-text-secondary text-sm hover:underline flex items-center gap-1"
                >
                    ← חזור לפרופיל
                </button>
                <AuthForm onSuccess={() => setShowAuthForm(false)} />
            </div>
        );
    }

    const sections = [
        {
            title: "זהות וערכים",
            icon: "✨",
            items: [
                { label: "שם", value: profile.name },
                { label: "גיל", value: profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : '-' },
                { label: "טלפון", value: profile.phone },
                { label: "הגדרה", value: profile.identity_tags?.join(', ') || '-' },
                { label: "ערכי ליבה", value: profile.core_values?.join(', ') || '-' },
                { label: "תחושת בוקר רצויה", value: profile.morning_feeling_desire }
            ]
        },
        {
            title: "מצב רגשי ורוחני",
            icon: "💫",
            items: [
                { label: "מצב נוכחי", value: profile.current_state },
                { label: "פוקוס רגשי", value: profile.emotional_state_focus },
                { label: "כוונה", value: profile.current_intention },
                { label: "חסם (Shadow)", value: profile.shadow_blocker }
            ]
        },
        {
            title: "יחסים וקריירה",
            icon: "💼",
            items: [
                { label: "זוגיות", value: `${profile.relationship_status || '-'} ${profile.relationship_desire?.length ? `(מחפש: ${profile.relationship_desire.join(', ')})` : ''}` },
                { label: "קריירה", value: profile.career_money_status },
                { label: "יחס לשפע", value: profile.money_relationship }
            ]
        },
        {
            title: "עיבוד וחיבור",
            icon: "🧠",
            items: [
                { label: "ערוץ קליטה", value: profile.processing_style === 'head' ? 'ראש (היגיון)' : profile.processing_style === 'heart' ? 'לב (רגש)' : profile.processing_style === 'body' ? 'גוף (מעשה)' : '-' },
                { label: "מסורות", value: profile.ideologies?.join(', ') },
                { label: "חוזקות", value: profile.personal_strengths?.join(', ') }
            ]
        }
    ];

    const themeOptions = [
        { id: 'light', label: 'בהיר', icon: Sun },
        { id: 'auto', label: 'אוטומטי', icon: Monitor },
        { id: 'dark', label: 'כהה', icon: Moon },
    ] as const;

    return (
        <div className="space-y-5 pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2 pt-2"
            >
                <h1 className="text-3xl font-bold gradient-text">הפרופיל הרוחני שלך</h1>
                <p className="text-text-secondary text-sm">כל המידע שנאסף עליך</p>
            </motion.div>

            {/* Theme Toggle Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="card p-5"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                            {isDark ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                            <div className="font-bold text-sm">מצב תאורה</div>
                            <div className="text-xs text-text-secondary">
                                {mode === 'auto' ? 'אוטומטי לפי שעה' : mode === 'dark' ? 'מצב כהה' : 'מצב בהיר'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {themeOptions.map(option => {
                        const Icon = option.icon;
                        const isActive = mode === option.id;
                        return (
                            <motion.button
                                key={option.id}
                                onClick={() => setMode(option.id)}
                                whileTap={{ scale: 0.95 }}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${isActive
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-surface-bg text-text-secondary hover:bg-border-muted'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {option.label}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Auth / Cloud Sync Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-elevated p-5"
            >
                {authLoading ? (
                    <div className="flex items-center justify-center py-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                ) : user ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                                <Cloud className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">מחובר לענן</div>
                                <div className="text-xs text-text-secondary truncate max-w-[140px]">{user.email}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                onClick={handleSyncToCloud}
                                disabled={syncing}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-2 bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm"
                            >
                                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                                סנכרן
                            </motion.button>
                            <motion.button
                                onClick={handleLogout}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-2 bg-surface-bg rounded-xl text-sm font-medium flex items-center gap-1.5"
                            >
                                <LogOut className="w-4 h-4" /> יציאה
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-surface-bg flex items-center justify-center">
                                <CloudOff className="w-5 h-5 text-text-muted" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">לא מחובר</div>
                                <div className="text-xs text-text-secondary">הנתונים נשמרים מקומית בלבד</div>
                            </div>
                        </div>
                        <motion.button
                            onClick={() => setShowAuthForm(true)}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm"
                        >
                            <LogIn className="w-4 h-4" /> התחבר
                        </motion.button>
                    </div>
                )}
            </motion.div>

            {/* Notification Settings Card */}
            {isSupported && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="card p-5 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notificationPermission === 'granted' ? 'bg-gradient-to-br from-accent to-orange-500' : 'bg-surface-bg'}`}>
                            {notificationPermission === 'granted' ? (
                                <Bell className="w-5 h-5 text-white" />
                            ) : (
                                <BellOff className="w-5 h-5 text-text-muted" />
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-sm">תזכורות יומיות</div>
                            <div className="text-xs text-text-secondary">
                                {notificationPermission === 'granted' ? 'מופעל ✓' : 'כבוי'}
                            </div>
                        </div>
                    </div>
                    {notificationPermission !== 'granted' && (
                        <motion.button
                            onClick={handleEnableNotifications}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gradient-to-r from-accent to-orange-500 text-white rounded-xl text-sm font-bold"
                        >
                            הפעל
                        </motion.button>
                    )}
                </motion.div>
            )}

            {/* Bio Card */}
            {profile.bio && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary to-purple-500" />
                    <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        הסיפור שלך
                    </h3>
                    <p className="text-text-secondary leading-relaxed italic text-sm">
                        "{profile.bio}"
                    </p>
                </motion.div>
            )}

            {/* Sections Grid */}
            <div className="space-y-4">
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + idx * 0.05 }}
                        className="card p-5"
                    >
                        <h3 className="text-primary font-bold mb-4 text-sm flex items-center gap-2">
                            <span>{section.icon}</span>
                            {section.title}
                        </h3>
                        <div className="space-y-3">
                            {section.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-start border-b border-border-muted last:border-0 pb-2 last:pb-0">
                                    <span className="text-text-muted text-xs">{item.label}</span>
                                    <span className="font-medium text-right max-w-[60%] text-xs">{item.value || '-'}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Vision */}
            {profile.perfect_text_vision && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="card-elevated p-5 bg-gradient-to-br from-primary/5 to-purple-500/5"
                >
                    <h3 className="text-primary font-bold mb-2 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        החזון לטקסט המושלם
                    </h3>
                    <p className="text-text-secondary leading-relaxed text-sm">
                        {profile.perfect_text_vision}
                    </p>
                </motion.div>
            )}

            {/* User ID */}
            <div className="text-center text-xs text-text-muted opacity-50 py-2">
                מזהה משתמש: {profile.id?.slice(0, 8)}...
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <motion.button
                        onClick={() => {
                            window.location.href = '/onboarding?mode=edit';
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3.5 border-2 border-primary text-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                        ערוך פרופיל
                    </motion.button>
                    <motion.button
                        onClick={() => {
                            if (confirm('האם אתה בטוח שברצונך למחוק את הפרופיל ולהתחיל מחדש?')) {
                                localStorage.removeItem('kavana_user_profile');
                                window.location.href = '/';
                            }
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3.5 border-2 border-rose-200 dark:border-rose-800 text-rose-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        התחל מחדש
                    </motion.button>
                </div>
                <motion.button
                    onClick={() => {
                        window.location.href = '/about';
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-surface-bg text-text-secondary rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors hover:bg-border-muted"
                >
                    <Sparkles className="w-4 h-4" />
                    החזון שלנו (אודות)
                </motion.button>
            </div>
        </div>
    );
}
