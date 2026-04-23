"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, saveProfile } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { sendAdminAlert } from '@/lib/admin';
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2, Heart, Star, Shield, Target, MessageSquare, Briefcase, Zap, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

const INITIAL_PROFILE: Partial<UserProfile> = {
    core_values: [],
    prayer_meaning: [],
    content_boundaries: [],
    personal_abilities: [],
    onboarding_completed: false,
    tone: 'Adaptive',
    addressing_mode: 'Direct',
    language: 'he',
    calendar_subscriptions: []
};

export default function OnboardingWizard() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<UserProfile>>(INITIAL_PROFILE);
    const [customBelief, setCustomBelief] = useState('');
    const [customCulture, setCustomCulture] = useState('');

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const updateField = (field: keyof UserProfile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleArrayItem = (field: keyof UserProfile, item: string) => {
        setFormData(prev => {
            const arr = (prev[field] as string[]) || [];
            if (arr.includes(item)) return { ...prev, [field]: arr.filter(i => i !== item) };
            return { ...prev, [field]: [...arr, item] };
        });
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 9));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

    const finishOnboarding = async () => {
        setIsSaving(true);
        try {
            const finalProfile = {
                ...formData,
                onboarding_completed: true,
            } as UserProfile;

            // Send alerts if custom cultures were entered
            if (formData.belief_system === 'אחר' && customBelief) {
                await sendAdminAlert('custom_belief', customBelief, finalProfile.id);
            }
            if (formData.cultural_connections?.includes('אחר') && customCulture) {
                await sendAdminAlert('custom_culture', customCulture, finalProfile.id);
            }

            // Send anonymous telemetry
            const { sendTelemetry } = require('@/lib/admin');
            await sendTelemetry('onboarding_complete', {
                belief_system: finalProfile.belief_system,
                current_state: finalProfile.current_state,
                usage_mode: finalProfile.usage_mode
            });

            await saveProfile(finalProfile);
            toast.success('הפרופיל המקודש נוצר בהצלחה / Profile created successfully');
            router.push('/dashboard');
        } catch (e) {
            toast.error('אירעה שגיאה בשמירת הפרופיל');
            setIsSaving(false);
        }
    };

    const totalSteps = 10;

    const steps = [
        // Step 1: Identity & Basics
        <Step key="identity" title="שלב 1: שפה והיכרות" subtitle="Language & Basics">
            <div className="space-y-8">
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">Language / שפה</label>
                    <div className="flex gap-3">
                        <SelectButton selected={formData.language === 'he'} onClick={() => updateField('language', 'he')} className="flex-1">עברית</SelectButton>
                        <SelectButton selected={formData.language === 'en'} onClick={() => updateField('language', 'en')} className="flex-1">English</SelectButton>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">איך נקרא לך? / Name</label>
                    <input
                        type="text"
                        className="input w-full text-2xl font-bold"
                        value={formData.name || ''}
                        onChange={e => updateField('name', e.target.value)}
                        placeholder="השם שלך..."
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">מערכת אמונות / Belief System</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['חילוני', 'מסורתי', 'דתי', 'רוחני', 'נוצרי', 'מוסלמי', 'אחר'].map(tag => (
                            <SelectButton
                                key={tag}
                                selected={formData.belief_system === tag}
                                onClick={() => updateField('belief_system', tag)}
                            >
                                {tag}
                            </SelectButton>
                        ))}
                    </div>
                    {formData.belief_system === 'אחר' && (
                        <input type="text" className="input w-full" placeholder="פרט כאן / Detail here..." value={customBelief} onChange={e => setCustomBelief(e.target.value)} />
                    )}
                </div>
            </div>
        </Step>,

        // Step 2: Values
        <Step key="values" title="שלב 2: עולם הערכים שלך" subtitle="מה באמת חשוב לך בחיים?">
            <div className="grid grid-cols-2 gap-3">
                {[
                    'משפחה', 'חופש', 'משמעות', 'צמיחה', 'שפע', 'רוחניות', 'עומק רגשי', 'שקט', 'נתינה', 'אמת'
                ].map(val => (
                    <SelectButton
                        key={val}
                        selected={formData.core_values?.includes(val)}
                        onClick={() => toggleArrayItem('core_values', val)}
                    >
                        {val}
                    </SelectButton>
                ))}
            </div>
        </Step>,

        // Step 3: Emotional State
        <Step key="state" title="שלב 3: המצב הרגשי שלך" subtitle="איפה אתה נמצא היום?">
            <div className="grid grid-cols-2 gap-3">
                {['מחפש כיוון', 'ביציבות', 'בשינוי גדול', 'עייפות רגשית', 'בתנופת עשייה', 'תהליך ריפוי'].map(st => (
                    <SelectButton
                        key={st}
                        selected={formData.current_state === st}
                        onClick={() => updateField('current_state', st)}
                    >
                        {st}
                    </SelectButton>
                ))}
            </div>
        </Step>,

        // Step 4: Relationships
        <Step key="relationship" title="שלב 4: זוגיות ואינטימיות" subtitle="איך נדבר על זוגיות בטקסטים?">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    {['בעדינות ורגישות', 'בישירות ופרקטיות', 'כמיהה לעתיד', 'חיזוק הקיים'].map(opt => (
                        <SelectButton
                            key={opt}
                            selected={formData.relationship_approach_in_texts === opt}
                            onClick={() => updateField('relationship_approach_in_texts', opt)}
                        >
                            {opt}
                        </SelectButton>
                    ))}
                </div>
                <input 
                    className="input w-full" 
                    placeholder="סטטוס זוגי..." 
                    value={formData.relationship_status || ''} 
                    onChange={e => updateField('relationship_status', e.target.value)} 
                />
            </div>
        </Step>,

        // Step 5: Career & Money
        <Step key="career" title="שלב 5: עבודה, כסף ושפע" subtitle="המקום של עבודה וכסף בחיים שלך">
            <div className="grid grid-cols-2 gap-3">
                {['הישרדות', 'בנייה', 'התרחבות', 'שפע', 'חיפוש כיוון', 'איזון'].map(s => (
                    <SelectButton
                        key={s}
                        selected={formData.work_money_place === s}
                        onClick={() => updateField('work_money_place', s)}
                    >
                        {s}
                    </SelectButton>
                ))}
            </div>
        </Step>,

        // Step 6: Tradition & Philosophy
        <Step key="tradition" title="שלב 6: מסורת ותרבות" subtitle="לאילו עולמות תרבותיים אתה מרגיש חיבור?">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    {['יהדות', 'קבלה', 'תנ"ך', 'בודהיזם', 'נצרות', 'אסלאם', 'פסיכולוגיה', 'אחר'].map(t => (
                        <SelectButton
                            key={t}
                            selected={formData.cultural_connections?.includes(t)}
                            onClick={() => toggleArrayItem('cultural_connections', t)}
                        >
                            {t}
                        </SelectButton>
                    ))}
                </div>
                {formData.cultural_connections?.includes('אחר') && (
                    <input type="text" className="input w-full" placeholder="תרבות אחרת / Other culture..." value={customCulture} onChange={e => setCustomCulture(e.target.value)} />
                )}
                
                <div className="pt-4 border-t border-black/5 space-y-4">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">לוחות שנה להצגה (אופציונלי / Opt-in Calendars)</label>
                    <div className="grid grid-cols-2 gap-3">
                        <SelectButton selected={formData.calendar_subscriptions?.includes('zadok')} onClick={() => toggleArrayItem('calendar_subscriptions', 'zadok')}>
                            לוח בני צדוק (Zadok)
                        </SelectButton>
                        <SelectButton selected={formData.calendar_subscriptions?.includes('hebrew')} onClick={() => toggleArrayItem('calendar_subscriptions', 'hebrew')}>
                            לוח עברי (Hebrew)
                        </SelectButton>
                    </div>
                </div>
            </div>
        </Step>,

        // Step 7: Strengths (The Gold for AI)
        <Step key="strengths" title="שלב 7: החוזקות שלך" subtitle="מה אתה מזהה בעצמך? (זה זהב ל-AI)">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {['הקשבה', 'רגישות', 'אומץ', 'חוסן', 'יצירתיות', 'מנהיגות'].map(s => (
                        <SelectButton
                            key={s}
                            selected={formData.personal_abilities?.includes(s)}
                            onClick={() => toggleArrayItem('personal_abilities', s)}
                        >
                            {s}
                        </SelectButton>
                    ))}
                </div>
                <textarea 
                    className="input w-full h-32" 
                    placeholder="עוד חוזקות וכישורים שיש לך..." 
                    value={formData.inspiring_people || ''} 
                    onChange={e => updateField('inspiring_people', e.target.value)} 
                />
            </div>
        </Step>,

        // Step 8: Boundaries & Tone
        <Step key="boundaries" title="שלב 8: גבולות ושפה" subtitle="מה חשוב לך שלא יופיע בטקסטים?">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    {['שפה דתית', 'אלוהים', 'שפה מינית', 'רגשני מדי', 'רוחני מדי'].map(b => (
                        <SelectButton
                            key={b}
                            selected={formData.content_boundaries?.includes(b)}
                            onClick={() => toggleArrayItem('content_boundaries', b)}
                        >
                            {b}
                        </SelectButton>
                    ))}
                </div>
                <div className="flex gap-3">
                    {['Direct', 'Soft', 'Poetic'].map(t => (
                        <SelectButton key={t} selected={formData.tone === t} onClick={() => updateField('tone', t)} className="flex-1">
                            {t === 'Direct' ? 'ישיר' : t === 'Soft' ? 'רך' : 'פיוטי'}
                        </SelectButton>
                    ))}
                </div>
            </div>
        </Step>,

        // Step 9: Usage & Reminders
        <Step key="usage" title="שלב 9: קצב ושימוש" subtitle="איך תרצה להשתמש באפליקציה?">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    {['בוקר וערב', 'רק בבוקר', 'רק בערב', 'פריקה רגשית בלבד'].map(u => (
                        <SelectButton key={u} selected={formData.usage_mode === u} onClick={() => updateField('usage_mode', u)}>
                            {u}
                        </SelectButton>
                    ))}
                </div>
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="block text-[10px] font-bold text-text-secondary uppercase">תזכורת בוקר</label>
                        <input type="time" className="input w-full" value={formData.morning_reminder_time || '07:00'} onChange={e => updateField('morning_reminder_time', e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="block text-[10px] font-bold text-text-secondary uppercase">תזכורת ערב</label>
                        <input type="time" className="input w-full" value={formData.evening_reminder_time || '21:00'} onChange={e => updateField('evening_reminder_time', e.target.value)} />
                    </div>
                </div>
            </div>
        </Step>,

        // Step 10: The Big Question
        <Step key="goal" title="שלב 10: השאלה הכי חשובה" subtitle="מה תרצה לקבל מהטקסטים?">
            <div className="space-y-6">
                <textarea className="input w-full h-40 text-xl" placeholder="המטרה שלי בשימוש ב-Kavana AI היא..." value={formData.current_goal || ''} onChange={e => updateField('current_goal', e.target.value)} />
                <div className="p-6 bg-accent-active/5 rounded-2xl text-center italic text-sacred">
                    "סיימת את מסע ההיכרות! כל השלבים הושלמו. המערכת מכירה אותך עמוק ויכולה ליצור תוכן מותאם במיוחד עבורך."
                </div>
            </div>
        </Step>
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#E8E2D2]">
            <header className="px-6 pt-8 pb-6">
                {/* User Bar */}
                <div className="flex items-center justify-between mb-6 max-w-lg mx-auto">
                    <div className="flex items-center gap-3">
                        {user?.user_metadata?.avatar_url ? (
                            <img 
                                src={user.user_metadata.avatar_url} 
                                alt="Profile" 
                                className="w-9 h-9 rounded-full border-2 border-accent-active/20"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-accent-active/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-accent-active" />
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-text-secondary">שלום,</p>
                            <p className="text-sm font-bold text-text-primary">{displayName}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 text-text-secondary transition-colors text-sm"
                        title="התנתק"
                    >
                        <span className="hidden sm:inline">התנתק</span>
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center justify-between mb-8 max-w-lg mx-auto">
                    <button onClick={prevStep} disabled={step === 0} className="p-2 rounded-xl disabled:opacity-0 text-text-secondary">
                        <ArrowRight className="w-6 h-6" />
                    </button>
                    
                    <div className="flex gap-2">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className={`step-circle ${i <= step ? 'lit' : ''} !w-2 !h-2`} />
                        ))}
                    </div>
                    <div className="w-10" />
                </div>
            </header>

            <div className="flex-1 px-6 max-w-lg mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                        {steps[step]}
                    </motion.div>
                </AnimatePresence>
            </div>

            <footer className="p-6 safe-bottom max-w-lg mx-auto w-full">
                <button
                    onClick={step === totalSteps - 1 ? finishOnboarding : nextStep}
                    disabled={isSaving}
                    className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3"
                >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                     step === totalSteps - 1 ? <><Sparkles className="w-6 h-6" /> צא לדרך</> : 
                     <>המשך <ArrowLeft className="w-6 h-6" /></>}
                </button>
            </footer>
        </div>
    );
}

function Step({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }) {
    return (
        <div className="space-y-8">
            <div className="text-center sm:text-right">
                <h1 className="text-3xl font-bold text-sacred mb-2">{title}</h1>
                {subtitle && <p className="text-text-secondary italic text-lg leading-tight">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

function SelectButton({ selected, onClick, children, className = '' }: any) {
    return (
        <motion.button 
            whileTap={{ scale: 0.98 }} 
            onClick={onClick} 
            className={`p-4 rounded-xl border-2 transition-all text-lg font-medium ${selected ? 'bg-accent-active/10 border-accent-active text-accent-active shadow-sm' : 'bg-white/50 border-black/5 text-text-secondary hover:border-black/10'} ${className}`}
        >
            {children}
        </motion.button>
    );
}
