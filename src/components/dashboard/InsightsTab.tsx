import React, { useEffect, useState } from 'react';
import { getPrayers, PrayerEntry } from '@/lib/storage';
import { PieChart, TrendingUp, Activity, ShieldAlert } from 'lucide-react';

export default function InsightsTab() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const prayers = getPrayers();
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

    if (!stats) return <div className="text-center py-20 opacity-50">אין מספיק נתונים לניתוח עדיין...</div>;

    const renderBar = (label: string, count: number, total: number, color: string) => {
        const pct = Math.round((count / total) * 100);
        return (
            <div key={label} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span className="font-mono font-bold text-gray-400">{pct}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${color} transition-all duration-1000`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 pt-4 pb-20 px-4">
            <div className="space-y-1">
                <h1 className="text-2xl font-serif font-bold text-primary">מבט על הנפש</h1>
                <p className="text-sm text-text-secondary">זיהוי דפוסים ותנועות פנימיות</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-text-secondary">כוונות שנבראו</div>
                </div>
                <div className="bg-card p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <Activity className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-xs text-text-secondary">נוכחות השבוע</div>
                </div>
            </div>

            {/* Shadow Analysis */}
            <div className="bg-card p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <h3 className="font-bold">הצללים שלך (חסמים)</h3>
                </div>
                <div className="space-y-2">
                    {Object.entries(stats.shadows)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([label, count]) => renderBar(label, count as number, stats.total, 'bg-rose-400'))
                    }
                </div>
            </div>

            {/* Focus Analysis */}
            <div className="bg-card p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold">מיקודי הלב</h3>
                </div>
                <div className="space-y-2">
                    {Object.entries(stats.focus)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([label, count]) => renderBar(label, count as number, stats.total, 'bg-blue-400'))
                    }
                </div>
            </div>

            <ResourceBuilder />
        </div>
    );
}

function ResourceBuilder() {
    const [profile, setProfile] = useState<any>(null);
    const [strengthsInput, setStrengthsInput] = useState('');
    const [successInput, setSuccessInput] = useState('');
    const [activeTab, setActiveTab] = useState<'strengths' | 'success'>('strengths');

    useEffect(() => {
        const { getProfile } = require('@/lib/storage');
        setProfile(getProfile());
    }, []);

    const handleAdd = (type: 'strengths' | 'success') => {
        if (!profile) return;
        const input = type === 'strengths' ? strengthsInput : successInput;
        if (!input.trim()) return;

        const newItems = input.split('\n').map(s => s.trim()).filter(s => s.length > 0);

        let updatedProfile = { ...profile };
        if (type === 'strengths') {
            updatedProfile.personal_strengths = [...(updatedProfile.personal_strengths || []), ...newItems];
            setStrengthsInput('');
        } else {
            updatedProfile.success_bank = [...(updatedProfile.success_bank || []), ...newItems];
            setSuccessInput('');
        }

        const { saveProfile } = require('@/lib/storage');
        saveProfile(updatedProfile);
        setProfile(updatedProfile);
        // Toast could go here
    };

    const handleDelete = (type: 'strengths' | 'success', index: number) => {
        let updatedProfile = { ...profile };
        if (type === 'strengths') {
            updatedProfile.personal_strengths = updatedProfile.personal_strengths.filter((_: any, i: number) => i !== index);
        } else {
            updatedProfile.success_bank = updatedProfile.success_bank.filter((_: any, i: number) => i !== index);
        }
        const { saveProfile } = require('@/lib/storage');
        saveProfile(updatedProfile);
        setProfile(updatedProfile);
    };

    if (!profile) return null;

    const currentList = activeTab === 'strengths'
        ? (profile.personal_strengths || [])
        : (profile.success_bank || []);

    return (
        <div className="bg-card p-5 rounded-2xl border border-gray-100 shadow-sm mt-8">
            <h3 className="font-bold text-lg mb-4 text-primary">בנק המשאבים (CBT)</h3>

            <div className="flex bg-gray-50 p-1 rounded-xl mb-4">
                <button
                    onClick={() => setActiveTab('strengths')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'strengths' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                >
                    הכוחות שלי
                </button>
                <button
                    onClick={() => setActiveTab('success')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'success' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                >
                    ההצלחות שלי
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <textarea
                        className="w-full p-3 rounded-xl border border-gray-200 h-24 resize-none focus:ring-2 focus:ring-primary outline-none text-sm"
                        placeholder={activeTab === 'strengths' ? "הדבק כאן רשימת יכולות (כל שורה יכולה חדשה)..." : "הדבק כאן רשימת הצלחות..."}
                        value={activeTab === 'strengths' ? strengthsInput : successInput}
                        onChange={e => activeTab === 'strengths' ? setStrengthsInput(e.target.value) : setSuccessInput(e.target.value)}
                    />
                    <button
                        onClick={() => handleAdd(activeTab)}
                        className="mt-2 w-full py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors"
                    >
                        הוסף לרשימה
                    </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {currentList.length === 0 && <div className="text-center text-sm text-gray-400 py-4">המאגר ריק. התחל למלא אותו!</div>}
                    {currentList.map((item: string, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group">
                            <span className="text-sm font-medium">{item}</span>
                            <button
                                onClick={() => handleDelete(activeTab, idx)}
                                className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
