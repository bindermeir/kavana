"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, saveProfile } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';

const INITIAL_PROFILE: Partial<UserProfile> = {
    identity_tags: [],
    ideologies: [],
    cultural_connections: [],
    life_focus_areas: [],
    current_challenges: [],
    custom_instructions: [],
    core_values: [],
    relationship_desire: [],
    personal_strengths: [],
    content_boundaries: [],
    tradition_connection_style: [],
    onboarding_stage: 0,
    onboarding_completed: false,
    processing_style: undefined,
    shadow_blocker: undefined
};

export default function OnboardingWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<Partial<UserProfile>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kavana_user_profile');
            if (saved) return { ...INITIAL_PROFILE, ...JSON.parse(saved) };
        }
        return INITIAL_PROFILE;
    });

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

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const finishOnboarding = () => {
        const finalProfile = {
            ...formData,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            onboarding_completed: true,
            prayerStyle: 'active',
            focusAreas: formData.life_focus_areas
        } as unknown as UserProfile;

        saveProfile(finalProfile);
        router.push('/dashboard');
    };

    const totalSteps = 12;

    const steps = [
        // Step 1: Identity & Basics
        <Step key="identity" title="בואו נכיר" subtitle="נתחיל בהיכרות קצרה">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-text-secondary">איך נקרא לך?</label>
                    <input
                        type="text"
                        className="input w-full text-lg"
                        value={formData.name || ''}
                        onChange={e => updateField('name', e.target.value)}
                        placeholder="השם שלך..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-3 text-text-secondary">איך היית מגדיר את עצמך היום?</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['חילוני', 'מסורתי', 'דתי', 'רוחני לא-דתי', 'ניו־אייג׳', 'ספקן / פילוסופי', 'אחר'].map(tag => (
                            <SelectButton
                                key={tag}
                                selected={formData.identity_tags?.includes(tag)}
                                onClick={() => toggleArrayItem('identity_tags', tag)}
                            >
                                {tag}
                            </SelectButton>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-3 text-text-secondary">מגדר (לצורך ניסוח)</label>
                    <div className="flex gap-3">
                        {['male', 'female'].map(g => (
                            <SelectButton
                                key={g}
                                selected={formData.gender === g}
                                onClick={() => updateField('gender', g)}
                                className="flex-1"
                                variant="large"
                            >
                                {g === 'male' ? 'זכר' : 'נקבה'}
                            </SelectButton>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-secondary">תאריך לידה</label>
                        <input
                            type="date"
                            className="input w-full"
                            value={formData.date_of_birth || ''}
                            onChange={e => updateField('date_of_birth', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-secondary">טלפון</label>
                        <input
                            type="tel"
                            className="input w-full ltr text-right"
                            value={formData.phone || ''}
                            onChange={e => updateField('phone', e.target.value)}
                            placeholder="050-0000000"
                        />
                    </div>
                </div>
            </div>
        </Step>,

        // Step 2: Core Values
        <Step key="values" title="עולם הערכים שלך" subtitle="בחר 3-5 ערכים מרכזיים">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-2">
                    {['משפחה', 'זוגיות', 'חופש', 'משמעות', 'יציבות', 'צמיחה', 'כסף ושפע', 'רוחניות', 'תרומה', 'ידע', 'עומק רגשי', 'שקט'].map(val => (
                        <SelectButton
                            key={val}
                            selected={formData.core_values?.includes(val)}
                            onClick={() => toggleArrayItem('core_values', val)}
                            variant="value"
                        >
                            {val}
                        </SelectButton>
                    ))}
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-text-secondary">כשאתה קם בבוקר, מה אתה הכי רוצה להרגיש?</label>
                    <select
                        className="input w-full"
                        value={formData.morning_feeling_desire || ''}
                        onChange={e => updateField('morning_feeling_desire', e.target.value)}
                    >
                        <option value="">בחר/י רגש...</option>
                        {['רגוע', 'חד', 'מחובר', 'נאהב', 'בטוח', 'מלא אנרגיה', 'בעל כיוון'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            </div>
        </Step>,

        // Step 3: Emotional State
        <Step key="emotional" title="המצב הרגשי שלך" subtitle="איפה אתה נמצא כרגע?">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold mb-3 text-text-secondary">באיזה מקום אתה מרגיש את עצמך לאחרונה?</label>
                    <div className="flex flex-wrap gap-2">
                        {['יציב', 'מחפש', 'עייף', 'נרגש', 'מבולבל', 'בתנועה', 'בתקופת שינוי'].map(st => (
                            <SelectButton
                                key={st}
                                selected={formData.current_state === st}
                                onClick={() => updateField('current_state', st)}
                                variant="pill"
                            >
                                {st}
                            </SelectButton>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-3 text-text-secondary">רגש שמבקש תשומת לב:</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['ביטחון', 'חמלה', 'אומץ', 'סבלנות', 'תשוקה', 'אמון', 'גבולות', 'שמחה'].map(emo => (
                            <SelectButton
                                key={emo}
                                selected={formData.emotional_state_focus === emo}
                                onClick={() => updateField('emotional_state_focus', emo)}
                                variant="emotion"
                            >
                                {emo}
                            </SelectButton>
                        ))}
                    </div>
                </div>
                <input
                    className="input w-full"
                    placeholder="כוונה נוכחית (במילים שלך)..."
                    value={formData.current_intention || ''}
                    onChange={e => updateField('current_intention', e.target.value)}
                />
            </div>
        </Step>,

        // Step 4: Relationship
        <Step key="relationship" title="זוגיות ואינטימיות" subtitle="הקשרים שמשמעותיים לך">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-text-secondary">סטטוס זוגי:</label>
                    <select
                        className="input w-full"
                        value={formData.relationship_status || ''}
                        onChange={e => updateField('relationship_status', e.target.value)}
                    >
                        <option value="">בחר/י...</option>
                        {['בזוגיות', 'רווק/ה', 'גרוש/ה', 'בתהליך פרידה', 'לא רוצה זוגיות כרגע'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-3 text-text-secondary">מה אתה מבקש יותר בזוגיות?</label>
                    <div className="flex flex-wrap gap-2">
                        {['אהבה', 'אינטימיות', 'יציבות', 'תשוקה', 'שותפות', 'ריפוי', 'בהירות'].map(r => (
                            <SelectButton
                                key={r}
                                selected={formData.relationship_desire?.includes(r)}
                                onClick={() => toggleArrayItem('relationship_desire', r)}
                                variant="rose"
                            >
                                {r}
                            </SelectButton>
                        ))}
                    </div>
                </div>
            </div>
        </Step>,

        // Step 5: Career & Money
        <Step key="career" title="עבודה וכסף" subtitle="היחס שלך לפרנסה ושפע">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold mb-3 text-text-secondary">המקום של עבודה וכסף בחייך כרגע:</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['הישרדות', 'בנייה', 'התרחבות', 'מיצוי', 'חיפוש כיוון', 'שפע ונהנתנות', 'איזון'].map(s => (
                            <SelectButton
                                key={s}
                                selected={formData.career_money_status === s}
                                onClick={() => updateField('career_money_status', s)}
                                variant="emerald"
                            >
                                {s}
                            </SelectButton>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-text-secondary">היחס שלך לשפע:</label>
                    <select
                        className="input w-full"
                        value={formData.money_relationship || ''}
                        onChange={e => updateField('money_relationship', e.target.value)}
                    >
                        <option value="">בחר/י...</option>
                        {['אני רוצה יותר', 'אני לומד להכיל', 'יש בי פחד משפע', 'שפע הוא ערך מרכזי', 'פחות מעסיק אותי כרגע'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>
        </Step>,

        // Step 6: Tradition
        <Step key="tradition" title="חיבור למסורת" subtitle="עולמות ידע שמדברים אליך">
            <div className="flex flex-wrap gap-2">
                {['יהדות', 'תנ״ך', 'חז״ל', 'קבלה', 'סטואה', 'בודהיזם', 'פסיכולוגיה', 'מדע'].map(t => (
                    <SelectButton
                        key={t}
                        selected={formData.ideologies?.includes(t)}
                        onClick={() => toggleArrayItem('ideologies', t)}
                        variant="blue"
                    >
                        {t}
                    </SelectButton>
                ))}
            </div>
        </Step>,

        // Step 7: Strengths
        <Step key="strengths" title="החוזקות שלך" subtitle="יכולות שאתה מזהה בעצמך">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-2">
                    {['הקשבה', 'עומק', 'התמדה', 'רגישות', 'מנהיגות', 'יצירתיות', 'ראיית אנשים', 'אומץ', 'חוסן'].map(s => (
                        <SelectButton
                            key={s}
                            selected={formData.personal_strengths?.includes(s)}
                            onClick={() => toggleArrayItem('personal_strengths', s)}
                            variant="amber"
                        >
                            {s}
                        </SelectButton>
                    ))}
                </div>
                <input
                    className="input w-full"
                    placeholder="הצלחה אחת שאתה גאה בה..."
                    value={formData.proud_success || ''}
                    onChange={e => updateField('proud_success', e.target.value)}
                />
            </div>
        </Step>,

        // Step 8: Boundaries
        <Step key="boundaries" title="גבולות ושפה" subtitle="מה לא מתאים לך">
            <div className="space-y-3">
                <p className="text-sm text-text-secondary mb-4">סמן מה *לא* מתאים לך:</p>
                {['שפה דתית מדי', 'אזכור אלוהים', "שפה רוחנית מדי (ניו-אייג')", 'שפה רגשית מדי'].map(b => (
                    <SelectButton
                        key={b}
                        selected={formData.content_boundaries?.includes(b)}
                        onClick={() => toggleArrayItem('content_boundaries', b)}
                        variant="boundary"
                        className="w-full justify-between"
                    >
                        <span>{b}</span>
                        {formData.content_boundaries?.includes(b) && (
                            <span className="text-rose-500 text-xs font-bold">חסום</span>
                        )}
                    </SelectButton>
                ))}
            </div>
        </Step>,

        // Step 9: Usage Preference
        <Step key="usage" title="קצב ושימוש" subtitle="מתי ואיך תרצה לקרוא">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold mb-3 text-text-secondary">מתי תרצה לקרוא?</label>
                    <div className="flex gap-2">
                        {['בוקר', 'ערב', 'לפי מצב רוח'].map(t => (
                            <SelectButton
                                key={t}
                                selected={formData.reading_timing === t}
                                onClick={() => updateField('reading_timing', t)}
                                className="flex-1"
                            >
                                {t}
                            </SelectButton>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-text-secondary">מה הטקסט יעשה עבורך?</label>
                    <select
                        className="input w-full"
                        value={formData.text_purpose || ''}
                        onChange={e => updateField('text_purpose', e.target.value)}
                    >
                        <option value="">בחר...</option>
                        {['יאזן אותי', 'יכוון אותי', 'ירגיע', 'יחזק', 'יעורר', 'ילווה'].map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>
        </Step>,

        // Step 10: Processing Style
        <Step key="processing" title="איך הדברים מחלחלים אליך?" subtitle="ערוץ הקליטה שלך">
            <div className="space-y-3">
                {[
                    { id: 'head', title: 'הראש (היגיון ופרספקטיבה)', desc: '"אני צריך להבין את זה כדי להרגיש את זה."' },
                    { id: 'heart', title: 'הלב (רגש וחיבור)', desc: '"אני צריך להרגיש שרואים אותי."' },
                    { id: 'body', title: 'הגוף (עשייה ונוכחות)', desc: '"אני צריך תכלס או תחושת קרקוע."' }
                ].map(item => (
                    <SelectButton
                        key={item.id}
                        selected={formData.processing_style === item.id}
                        onClick={() => updateField('processing_style', item.id)}
                        variant="processing"
                        className="w-full text-right"
                    >
                        <div>
                            <div className="font-bold">{item.title}</div>
                            <div className="text-sm opacity-70 mt-1">{item.desc}</div>
                        </div>
                    </SelectButton>
                ))}
            </div>
        </Step>,

        // Step 11: The Shadow (Blocker)
        <Step key="shadow" title="מה חוסם אותך?" subtitle="הצל - כדי שהכוונה תהיה אפקטיבית">
            <div className="grid grid-cols-2 gap-3">
                {['פחד', 'ספק עצמי', 'כעס', 'דחיינות ועייפות', 'בדידות', 'רעש מחשבתי', 'אשמה', 'חוסר ודאות'].map(b => (
                    <SelectButton
                        key={b}
                        selected={formData.shadow_blocker === b}
                        onClick={() => updateField('shadow_blocker', b)}
                        variant="shadow"
                    >
                        {b}
                    </SelectButton>
                ))}
            </div>
        </Step>,

        // Step 12: The Vision (Macro to Micro)
        <Step key="vision" title="החזון הגדול שלך" subtitle="לאן אנחנו הולכים?">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-text-secondary">כוכב הצפון (1-5 שנים קדימה):</label>
                    <p className="text-xs text-text-secondary mb-3">מה החזון הגדול שלך? (למשל: לבנות עסק עצמאי, להקים משפחה, למצוא שקט נפשי)</p>
                    <textarea
                        className="input w-full h-24 resize-none"
                        value={formData.north_star_vision || ''}
                        onChange={e => updateField('north_star_vision', e.target.value)}
                        placeholder="החזון שלי הוא..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-text-secondary">המטרה התקופתית (החודש/הרבעון הקרוב):</label>
                    <p className="text-xs text-text-secondary mb-3">מה הצעד הקרוב בדרך לשם? (למשל: לסיים את התואר, למצוא זוגיות, להתמיד בספורט)</p>
                    <textarea
                        className="input w-full h-20 resize-none"
                        value={formData.period_goal || ''}
                        onChange={e => updateField('period_goal', e.target.value)}
                        placeholder="בתקופה הקרובה אני מתמקד ב..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-text-secondary">איך תרצה שהטקסט היומי ירגיש?</label>
                    <textarea
                        className="input w-full h-16 resize-none"
                        value={formData.perfect_text_vision || ''}
                        onChange={e => updateField('perfect_text_vision', e.target.value)}
                        placeholder="מושלם עבורי יהיה טקסט ש..."
                    />
                </div>
            </div>
        </Step>
    ];

    return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <motion.button
                        onClick={prevStep}
                        disabled={step === 0}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-xl disabled:opacity-0 hover:bg-surface-bg transition-colors"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </motion.button>

                    <span className="text-sm text-text-secondary font-medium">
                        {step + 1} / {totalSteps}
                    </span>

                    <div className="w-10" />
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-surface-bg rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 relative z-10 px-4 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                        className="h-full overflow-y-auto scrollbar-hide pb-4"
                    >
                        {steps[step]}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <footer className="relative z-10 p-4 safe-bottom">
                <motion.button
                    onClick={step === steps.length - 1 ? finishOnboarding : nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] shadow-lg shadow-primary/25 flex items-center justify-center gap-3"
                >
                    {step === steps.length - 1 ? (
                        <>
                            <Sparkles className="w-5 h-5" />
                            בוא נתחיל
                        </>
                    ) : (
                        <>
                            המשך
                            <ArrowLeft className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            </footer>
        </div>
    );
}

// Step Component
function Step({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }) {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold gradient-text">{title}</h1>
                {subtitle && <p className="text-text-secondary">{subtitle}</p>}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

// Reusable SelectButton Component
interface SelectButtonProps {
    selected?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'large' | 'pill' | 'value' | 'emotion' | 'rose' | 'emerald' | 'blue' | 'amber' | 'boundary' | 'processing' | 'shadow';
}

function SelectButton({ selected, onClick, children, className = '', variant = 'default' }: SelectButtonProps) {
    const baseStyles = "transition-all duration-200 font-medium";

    const variants: Record<string, string> = {
        default: `p-3 rounded-xl border ${selected ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20' : 'bg-card-bg border-border-color hover:border-primary/50'}`,
        large: `p-4 rounded-2xl border text-lg ${selected ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20' : 'bg-card-bg border-border-color'}`,
        pill: `px-4 py-2 rounded-full border ${selected ? 'bg-primary text-white border-primary' : 'bg-card-bg border-border-color'}`,
        value: `p-4 rounded-xl border h-14 flex items-center justify-center ${selected ? 'bg-primary text-white border-primary shadow-md' : 'bg-card-bg border-border-color'}`,
        emotion: `p-3 rounded-xl border ${selected ? 'bg-accent/10 border-accent text-accent-foreground' : 'bg-card-bg border-border-color'}`,
        rose: `px-4 py-2 rounded-full border ${selected ? 'bg-rose-100 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300' : 'bg-card-bg border-border-color'}`,
        emerald: `p-4 rounded-xl border text-center ${selected ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-700 font-semibold' : 'bg-card-bg border-border-color'}`,
        blue: `px-4 py-2 rounded-xl border ${selected ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-300' : 'bg-card-bg border-border-color'}`,
        amber: `p-4 rounded-xl border text-center ${selected ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-700 font-bold text-amber-900 dark:text-amber-300' : 'bg-card-bg border-border-color'}`,
        boundary: `p-4 rounded-xl border flex items-center ${selected ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700' : 'bg-card-bg border-border-color'}`,
        processing: `p-5 rounded-2xl border ${selected ? 'bg-primary/10 border-primary ring-2 ring-primary/20' : 'bg-card-bg border-border-color'}`,
        shadow: `p-5 rounded-xl border text-center ${selected ? 'bg-slate-700 dark:bg-slate-600 text-white border-slate-900 dark:border-slate-500' : 'bg-card-bg border-border-color'}`
    };

    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.97 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </motion.button>
    );
}
