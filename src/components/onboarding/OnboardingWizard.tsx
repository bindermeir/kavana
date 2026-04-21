"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, saveProfile } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const INITIAL_PROFILE: Partial<UserProfile> = {
    core_values: [],
    prayer_meaning: [],
    content_boundaries: [],
    onboarding_completed: false,
    tone: 'Adaptive',
    addressing_mode: 'Direct'
};

export default function OnboardingWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<UserProfile>>(INITIAL_PROFILE);

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

    const nextStep = () => setStep(prev => Math.min(prev + 1, 11));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

    const finishOnboarding = async () => {
        setIsSaving(true);
        try {
            const finalProfile = {
                ...formData,
                onboarding_completed: true,
            } as UserProfile;

            await saveProfile(finalProfile);
            toast.success('הפרופיל המקודש נוצר בהצלחה');
            router.push('/dashboard');
        } catch (e) {
            toast.error('אירעה שגיאה בשמירת הפרופיל');
            setIsSaving(false);
        }
    };

    const totalSteps = 12;

    const steps = [
        // Step 1: Identity
        <Step key="identity" title="מי אני?" subtitle="בואו נתחיל בהיכרות בסיסית">
            <div className="space-y-8">
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">איך נקרא לך?</label>
                    <input
                        type="text"
                        className="input w-full text-2xl font-bold"
                        value={formData.name || ''}
                        onChange={e => updateField('name', e.target.value)}
                        placeholder="השם שלך..."
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">מערכת אמונות</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['חילוני', 'מסורתי', 'דתי', 'רוחני', 'אחר'].map(tag => (
                            <SelectButton
                                key={tag}
                                selected={formData.belief_system === tag}
                                onClick={() => updateField('belief_system', tag)}
                            >
                                {tag}
                            </SelectButton>
                        ))}
                    </div>
                </div>
            </div>
        </Step>,

        // Step 2: Prayer Meaning
        <Step key="prayer" title="מהי תפילה עבורך?" subtitle="הגדרת הדיאלוג הפנימי">
            <div className="grid gap-3">
                {[
                    { id: 'חיבור פנימי', label: 'חיבור פנימי' },
                    { id: 'שיח עם אלוהים', label: 'שיח עם אלוהים' },
                    { id: 'מדיטציה', label: 'מדיטציה' },
                    { id: 'טקס אישי', label: 'טקס אישי' },
                    { id: 'שפה תרבותית', label: 'שפה תרבותית' }
                ].map(item => (
                    <SelectButton
                        key={item.id}
                        selected={formData.prayer_meaning?.includes(item.id)}
                        onClick={() => toggleArrayItem('prayer_meaning', item.id)}
                        className="w-full py-5 text-lg"
                    >
                        {item.label}
                    </SelectButton>
                ))}
            </div>
        </Step>,

        // Step 3: Core Values
        <Step key="values" title="ערכי ליבה" subtitle="מה מניע אותך בחיים? (בחר 3)">
            <div className="grid grid-cols-2 gap-3">
                {[
                    'משפחה', 'חופש', 'משמעות', 'צמיחה', 'שפע', 'רוחניות', 'עומק רגשי', 'שקט'
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

        // Step 11: Vision
        <Step key="vision" title="החזון הגדול" subtitle="לאן אנחנו הולכים?">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">כוכב הצפון (1-5 שנים)</label>
                    <textarea className="input w-full h-32 resize-none text-xl" value={formData.future_vision || ''} onChange={e => updateField('future_vision', e.target.value)} placeholder="איפה אתה רואה את עצמך?" />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">מטרה תקופתית</label>
                    <input className="input w-full text-lg" value={formData.current_goal || ''} onChange={e => updateField('current_goal', e.target.value)} placeholder="היעד הקרוב שלי..." />
                </div>
            </div>
        </Step>,

        // Step 12: Final
        <Step key="finish" title="ההיכל מוכן" subtitle="הפרופיל שלך הושלם">
            <div className="space-y-8 text-center py-10">
                <div className="w-32 h-32 rounded-full bg-accent-active/10 mx-auto flex items-center justify-center shadow-inner">
                    <Check className="w-16 h-16 text-accent-active" />
                </div>
                <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-sacred">ברוך הבא, {formData.name}</h3>
                    <p className="text-text-secondary italic text-lg leading-relaxed px-4">
                        המערכת מוכנה לייצר עבורך כוונות מדויקות המבוססות על מי שאתה ועל לאן שאתה שואף להגיע.
                    </p>
                </div>
            </div>
        </Step>
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#E8E2D2]">
            <header className="px-6 pt-12 pb-6">
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
                        {steps[step] || steps[0]}
                    </motion.div>
                </AnimatePresence>
            </div>

            <footer className="p-6 safe-bottom max-w-lg mx-auto w-full">
                <button
                    onClick={step === steps.length - 1 ? finishOnboarding : nextStep}
                    disabled={isSaving}
                    className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3"
                >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                     step === steps.length - 1 ? <><Sparkles className="w-6 h-6" /> צא לדרך</> : 
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
                <h1 className="text-4xl font-bold text-sacred mb-2">{title}</h1>
                {subtitle && <p className="text-text-secondary italic text-lg">{subtitle}</p>}
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
