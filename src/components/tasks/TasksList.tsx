"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTasks, Task, saveTask, UserProfile, getProfile } from '@/lib/storage';
import { CheckCircle2, ListChecks, Zap, Plus, ArrowLeft, Star, Loader2 } from 'lucide-react';
import StepItem from './StepItem';

export default function TasksList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState('');
    const [activeType, setActiveType] = useState<'success_list' | 'capability_list' | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [t, p] = await Promise.all([getTasks(), getProfile()]);
            setTasks(t);
            setProfile(p);
            setLoading(false);
        };
        fetchData();
    }, []);

    const successTasks = tasks.filter(t => t.task_type === 'success_list');
    const capabilityTasks = tasks.filter(t => t.task_type === 'capability_list');

    const handleAdd = async () => {
        if (!newItem.trim() || !activeType) return;
        
        const newTask: Omit<Task, 'user_id'> = {
            id: crypto.randomUUID(),
            task_type: activeType,
            content: newItem.trim(),
            completed: true,
            date: new Date().toISOString().split('T')[0]
        };

        await saveTask(newTask);
        setTasks([newTask as Task, ...tasks]);
        setNewItem('');
        setActiveType(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 text-accent-active animate-spin" />
                <p className="text-text-secondary italic">טוען את מרכז האימון...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pt-4 pb-20">
            <header className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-sacred">מרכז אימון</h1>
                <p className="text-text-secondary italic leading-relaxed px-4">
                    רשימות אלו מזינות את המערכת ומאפשרות לה להכיר אותך עמוק יותר
                </p>
            </header>

            <div className="space-y-6">
                {/* Success List Section */}
                <div className="sacred-card space-y-4">
                    <div className="flex justify-between items-center border-b border-border-color/20 pb-3">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500" />
                            <h3 className="text-xl font-bold text-sacred">רשימת הצלחות</h3>
                        </div>
                        <span className="text-xs font-bold text-accent-active bg-accent-active/5 px-3 py-1 rounded-full border border-accent-active/10">
                            {successTasks.length} פריטים
                        </span>
                    </div>
                    <p className="text-xs text-text-secondary italic">רשום הצלחות מהחיים שלך - קטנות וגדולות</p>
                    
                    <div className="space-y-2">
                        {successTasks.slice(0, 3).map((t, idx) => (
                            <div key={t.id} className="text-sacred flex items-start gap-2 py-1">
                                <span className="text-amber-500 mt-1">•</span>
                                <span className="text-lg font-light leading-tight">{t.content}</span>
                            </div>
                        ))}
                        {successTasks.length > 3 && (
                            <p className="text-xs text-accent-active font-bold pt-1">ועוד {successTasks.length - 3}...</p>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setActiveType('success_list')}
                        className="w-full py-3 border-2 border-dashed border-border-color/30 rounded-xl text-text-secondary flex items-center justify-center gap-2 hover:border-accent-active/30 hover:text-accent-active transition-all"
                    >
                        <Plus className="w-4 h-4" /> הוסף הצלחה
                    </button>
                </div>

                {/* Capability List Section */}
                <div className="sacred-card space-y-4">
                    <div className="flex justify-between items-center border-b border-border-color/20 pb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-teal-500" />
                            <h3 className="text-xl font-bold text-sacred">יש בי יכולת</h3>
                        </div>
                        <span className="text-xs font-bold text-accent-active bg-accent-active/5 px-3 py-1 rounded-full border border-accent-active/10">
                            {capabilityTasks.length} פריטים
                        </span>
                    </div>
                    <p className="text-xs text-text-secondary italic">רשום יכולות וכישורים שיש לך</p>
                    
                    <div className="space-y-2">
                        {capabilityTasks.slice(0, 3).map((t, idx) => (
                            <div key={t.id} className="text-sacred flex items-start gap-2 py-1">
                                <span className="text-teal-500 mt-1">•</span>
                                <span className="text-lg font-light leading-tight">{t.content}</span>
                            </div>
                        ))}
                        {capabilityTasks.length > 3 && (
                            <p className="text-xs text-accent-active font-bold pt-1">ועוד {capabilityTasks.length - 3}...</p>
                        )}
                    </div>

                    <button 
                        onClick={() => setActiveType('capability_list')}
                        className="w-full py-3 border-2 border-dashed border-border-color/30 rounded-xl text-text-secondary flex items-center justify-center gap-2 hover:border-accent-active/30 hover:text-accent-active transition-all"
                    >
                        <Plus className="w-4 h-4" /> הוסף יכולת
                    </button>
                </div>
            </div>

            {/* Input Modal */}
            <AnimatePresence>
                {activeType && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveType(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm sacred-card p-8">
                            <h3 className="text-2xl font-bold text-sacred mb-4">
                                {activeType === 'success_list' ? 'הוספת הצלחה' : 'הוספת יכולת'}
                            </h3>
                            <textarea 
                                className="input w-full h-32 resize-none text-xl mb-6"
                                placeholder={activeType === 'success_list' ? 'מה הצלחת לעשות?' : 'איזו יכולת קיימת בך?'}
                                value={newItem}
                                onChange={e => setNewItem(e.target.value)}
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setActiveType(null)} className="btn-ghost flex-1 py-4">ביטול</button>
                                <button onClick={handleAdd} className="btn-primary flex-1 py-4">שמור</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
