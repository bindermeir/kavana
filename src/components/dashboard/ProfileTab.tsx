"use client";

import React, { useState } from 'react';
import { UserProfile, saveProfile, clearAllData } from '@/lib/storage';
import { User, Shield, Target, Heart, MessageSquare, Trash2, Settings, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileTab({ profile }: { profile: UserProfile }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(profile);

    const handleSave = () => {
        saveProfile(editedProfile);
        setIsEditing(false);
        toast.success('הפרופיל המקודש עודכן');
        setTimeout(() => window.location.reload(), 500);
    };

    const handleReset = () => {
        if (confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים ולהתחיל מחדש? תהליך זה אינו הפיך.')) {
            clearAllData();
            window.location.href = '/onboarding';
        }
    };

    return (
        <div className="space-y-10 pb-24">
            <header className="text-center space-y-3">
                <div className="w-24 h-24 bg-accent-active/5 rounded-full flex items-center justify-center mx-auto text-accent-active border-2 border-accent-active/20 relative">
                    <User className="w-12 h-12" />
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="absolute -bottom-2 -right-2 p-2 bg-white shadow-md rounded-full text-text-secondary hover:text-accent-active transition-colors"
                    >
                        {isEditing ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                    </button>
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-sacred">{profile.name || 'משתמש'}</h1>
                    <p className="text-text-secondary italic">{profile.belief_system} • {profile.tone}</p>
                </div>
            </header>

            <div className="space-y-6">
                <AnimatePresence mode="wait">
                    {!isEditing ? (
                        <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            <Section icon={Target} title="החזון והמטרות">
                                <Field label="כוכב הצפון (1-5 שנים)" value={profile.future_vision} />
                                <Field label="מטרה תקופתית" value={profile.current_goal} />
                                <Field label="כוונה שנתית" value={profile.yearly_intention} />
                            </Section>

                            <Section icon={Shield} title="זהות וערכים">
                                <Field label="ערכי ליבה" value={profile.core_values?.join(', ')} />
                                <Field label="מערכת אמונות" value={profile.belief_system} />
                                <Field label="משמעות התפילה" value={profile.prayer_meaning?.join(', ')} />
                            </Section>

                            <Section icon={MessageSquare} title="סגנון וגבולות">
                                <Field label="טון דיבור" value={profile.tone} />
                                <Field label="גבולות תוכן" value={profile.content_boundaries?.join(', ')} />
                            </Section>

                            <Section icon={Heart} title="עולם אישי">
                                <Field label="סטטוס זוגי" value={profile.relationship_status} />
                                <Field label="גישה בזוגיות" value={profile.relationship_approach_in_texts} />
                                <Field label="קריירה ושפע" value={profile.work_money_place} />
                            </Section>
                        </motion.div>
                    ) : (
                        <motion.div key="edit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="sacred-card space-y-6">
                                <h3 className="text-xl font-bold text-sacred border-b border-border-color/20 pb-4">עריכת פרופיל</h3>
                                
                                <EditField label="שם מלא" value={editedProfile.name} onChange={v => setEditedProfile({...editedProfile, name: v})} />
                                <EditField label="חזון (כוכב הצפון)" value={editedProfile.future_vision} isTextArea onChange={v => setEditedProfile({...editedProfile, future_vision: v})} />
                                <EditField label="מטרה תקופתית" value={editedProfile.current_goal} onChange={v => setEditedProfile({...editedProfile, current_goal: v})} />
                                
                                <div className="flex gap-3 pt-6">
                                    <button onClick={() => setIsEditing(false)} className="btn-ghost flex-1 py-4">ביטול</button>
                                    <button onClick={handleSave} className="btn-primary flex-1 py-4 flex items-center justify-center gap-2">
                                        <Save className="w-5 h-5" /> שמור שינויים
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Danger Zone */}
            <div className="pt-10 border-t border-border-color/30 space-y-4">
                <button 
                    onClick={handleReset}
                    className="w-full py-5 rounded-2xl border-2 border-rose-100 text-rose-500 font-bold hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 className="w-5 h-5" /> איפוס כל הנתונים והתחלה מחדש
                </button>
            </div>
        </div>
    );
}

function Section({ icon: Icon, title, children }: any) {
    return (
        <div className="sacred-card space-y-6">
            <div className="flex items-center gap-3 border-b border-border-color/20 pb-4">
                <Icon className="w-6 h-6 text-accent-active" />
                <h3 className="font-bold text-sacred uppercase tracking-widest text-sm">{title}</h3>
            </div>
            <div className="grid gap-6">
                {children}
            </div>
        </div>
    );
}

function Field({ label, value }: { label: string, value?: string }) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">{label}</label>
            <p className="text-text-primary font-medium leading-relaxed">{value || 'לא הוגדר'}</p>
        </div>
    );
}

function EditField({ label, value, onChange, isTextArea }: any) {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold text-text-secondary uppercase">{label}</label>
            {isTextArea ? (
                <textarea 
                    className="input w-full h-32 resize-none" 
                    value={value || ''} 
                    onChange={e => onChange(e.target.value)}
                />
            ) : (
                <input 
                    className="input w-full" 
                    type="text" 
                    value={value || ''} 
                    onChange={e => onChange(e.target.value)}
                />
            )}
        </div>
    );
}
