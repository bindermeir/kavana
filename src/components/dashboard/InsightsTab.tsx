"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPrayers, getProfile, UserProfile, getTasks, Task } from '@/lib/storage';
import { PieChart, TrendingUp, Activity, ShieldAlert, Target, Compass, Sparkles } from 'lucide-react';
import TasksList from '../tasks/TasksList';

export default function InsightsTab() {
    const [stats, setStats] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const prayers = getPrayers();
        const profileData = getProfile() as UserProfile;
        const taskData = getTasks();
        
        setProfile(profileData);
        setTasks(taskData);

        if (!prayers.length) return;

        // Calculate Stats
        const total = prayers.length;

        // 1. Shadow Analysis
        const shadows: Record<string, number> = {};
        prayers.forEach(p => {
            const s = p.shadow_snapshot || 'לא צוין';
            shadows[s] = (shadows[s] || 0) + 1;
        });

        // 2. Focus Analysis
        const focus: Record<string, number> = {};
        prayers.forEach(p => {
            const f = p.focus_area || 'כללי';
            focus[f] = (focus[f] || 0) + 1;
        });

        setStats({ total, shadows, focus });
    }, []);

    const renderBar = (label: string, count: number, total: number, colorClass: string) => {
        const pct = Math.round((count / total) * 100);
        return (
            <div key={label} className="mb-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-text-secondary">
                    <span>{label}</span>
                    <span>{pct}%</span>
                </div>
                <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full ${colorClass}`}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10 pt-4 pb-24">
            <header className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-sacred">חדר מצב</h1>
                <p className="text-text-secondary italic">התפתחות, חזון ושיקוף עצמי</p>
            </header>

            {/* Macro Goals (The Compass) */}
            {(profile?.future_vision || profile?.current_goal) && (
                <div className="sacred-card bg-accent-active/5 border-accent-active/20 overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent-active/10 rounded-full blur-3xl" />
                    
                    {profile.future_vision && (
                        <div className="mb-6 relative z-10">
                            <h3 className="text-[10px] font-bold text-accent-active uppercase tracking-widest flex items-center gap-2 mb-3">
                                <Compass className="w-4 h-4" /> כוכב הצפון (חזון העל)
                            </h3>
                            <p className="text-2xl font-bold text-sacred leading-relaxed">
                                {profile.future_vision}
                            </p>
                        </div>
                    )}
                    
                    {profile.current_goal && (
                        <div className="relative z-10 pt-4 border-t border-accent-active/10">
                            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4" /> המטרה התקופתית
                            </h3>
                            <p className="text-text-primary font-medium">
                                {profile.current_goal}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="sacred-card p-6 text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-3 text-accent-active" />
                    <div className="text-3xl font-bold text-sacred">{stats?.total || 0}</div>
                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">כוונות שנבראו</div>
                </div>
                <div className="sacred-card p-6 text-center">
                    <Activity className="w-6 h-6 mx-auto mb-3 text-accent-active" />
                    <div className="text-3xl font-bold text-sacred">100%</div>
                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">נוכחות השבוע</div>
                </div>
            </div>

            {/* Training Center (TasksList) */}
            <div className="pt-2">
                <TasksList tasks={tasks} />
            </div>

            {/* Analysis Section */}
            {stats && (
                <div className="space-y-6">
                    <div className="sacred-card">
                        <div className="flex items-center gap-2 mb-6">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                            <h3 className="font-bold text-sacred uppercase tracking-widest text-sm">הצללים שלך (חסמים)</h3>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(stats.shadows)
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .map(([label, count]) => renderBar(label, count as number, stats.total, 'bg-rose-500/60'))
                            }
                        </div>
                    </div>

                    <div className="sacred-card">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChart className="w-5 h-5 text-accent-active" />
                            <h3 className="font-bold text-sacred uppercase tracking-widest text-sm">מיקודי הלב</h3>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(stats.focus)
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .map(([label, count]) => renderBar(label, count as number, stats.total, 'bg-accent-active/60'))
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
