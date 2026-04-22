"use client";

import React, { useState } from 'react';
import { UserProfile, saveProfile } from '@/lib/storage';
import { User, Target, Shield, Sparkles, Edit2, Check, Bell, BellOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ProfileTabProps {
    profile: UserProfile;
}

export default function ProfileTab({ profile: initialProfile }: ProfileTabProps) {
    const [profile, setProfile] = useState(initialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // Check for notification permission on load
    React.useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveProfile(profile);
            toast.success('הפרופיל עודכן בהצלחה');
            setIsEditing(false);
        } catch (e) {
            toast.error('שגיאה בשמירת הפרופיל');
        } finally {
            setIsSaving(false);
        }
    };

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            toast.error('הדפדפן שלך לא תומך בהתראות');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            setNotificationsEnabled(true);
            toast.success('ההתראות הופעלו בהצלחה!');
            // Here you would typically register the push subscription with the backend
        } else {
            toast.error('הרשאת ההתראות נדחתה');
        }
    };

    return (
        <div className="space-y-8 pt-4 pb-20">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent-active/10 rounded-full flex items-center justify-center text-accent-active">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-sacred">{profile.name}</h1>
                        <p className="text-xs text-text-secondary italic">הזהות המקודשת שלך</p>
                    </div>
                </div>
                <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="p-3 bg-white shadow-sm rounded-xl text-accent-active hover:scale-105 transition-transform"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditing ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </button>
            </header>

            <div className="space-y-6">
                {/* Notifications Card */}
                <div className="sacred-card p-6 flex justify-between items-center border-accent-active/20 bg-accent-active/5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${notificationsEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-sacred">תזכורות יומיות</h3>
                            <p className="text-xs text-text-secondary">קבל התראה בבוקר ובערב</p>
                        </div>
                    </div>
                    <button 
                        onClick={requestNotificationPermission}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${notificationsEnabled ? 'bg-white text-text-secondary cursor-default' : 'bg-accent-active text-white shadow-md'}`}
                        disabled={notificationsEnabled}
                    >
                        {notificationsEnabled ? 'פעיל' : 'הפעל'}
                    </button>
                </div>

                <Section icon={Target} title="החזון הגדול (כוכב הצפון)">
                    {isEditing ? (
                        <textarea 
                            className="input w-full h-32 text-lg" 
                            value={profile.future_vision} 
                            onChange={e => setProfile({...profile, future_vision: e.target.value})} 
                        />
                    ) : (
                        <p className="text-lg leading-relaxed text-sacred font-light italic">"{profile.future_vision}"</p>
                    )}
                </Section>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Section icon={Sparkles} title="המטרה הנוכחית">
                        {isEditing ? (
                            <input 
                                className="input w-full" 
                                value={profile.current_goal} 
                                onChange={e => setProfile({...profile, current_goal: e.target.value})} 
                            />
                        ) : (
                            <p className="text-sacred font-medium">{profile.current_goal}</p>
                        )}
                    </Section>

                    <Section icon={Shield} title="ערכי ליבה">
                        <div className="flex flex-wrap gap-2 pt-1">
                            {profile.core_values?.map(val => (
                                <span key={val} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-accent-active border border-accent-active/10 shadow-sm">
                                    {val}
                                </span>
                            ))}
                        </div>
                    </Section>
                </div>

                {isEditing && (
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase">תזכורת בוקר</label>
                            <input 
                                type="time" 
                                className="input w-full" 
                                value={profile.morning_reminder_time || '07:00'} 
                                onChange={e => setProfile({...profile, morning_reminder_time: e.target.value})} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase">תזכורת ערב</label>
                            <input 
                                type="time" 
                                className="input w-full" 
                                value={profile.evening_reminder_time || '21:00'} 
                                onChange={e => setProfile({...profile, evening_reminder_time: e.target.value})} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Section({ icon: Icon, title, children }: any) {
    return (
        <div className="sacred-card space-y-3">
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-accent-active" />
                <h3 className="font-bold text-[10px] text-accent-active uppercase tracking-widest">{title}</h3>
            </div>
            {children}
        </div>
    );
}
