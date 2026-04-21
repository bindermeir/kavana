import { getPrayers, PrayerEntry, getProfile, UserProfile } from '@/lib/storage';
import { PieChart, TrendingUp, Activity, ShieldAlert, Target, Compass, Sparkles, Plus, Trash2 } from 'lucide-react';

export default function InsightsTab() {
    const [stats, setStats] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

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
        setProfile(getProfile() as UserProfile);
    }, []);

    if (!stats || !profile) return <div className="text-center py-20 opacity-50">אין מספיק נתונים לניתוח עדיין...</div>;

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
            <div className="text-center space-y-2">
                <div className="text-sm text-text-secondary">חדר מצב</div>
                <h1 className="text-3xl font-serif font-bold text-primary">תובנות וחזון</h1>
            </div>

            {/* Macro Goals (The Compass) */}
            {(profile?.north_star_vision || profile?.period_goal) && (
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 p-6 rounded-3xl border border-indigo-500/20 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                    
                    {profile.north_star_vision && (
                        <div className="mb-5 relative z-10">
                            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <Compass className="w-4 h-4" /> כוכב הצפון (חזון העל)
                            </h3>
                            <p className="font-serif text-lg text-text-primary leading-relaxed">
                                {profile.north_star_vision}
                            </p>
                        </div>
                    )}
                    
                    {profile.period_goal && (
                        <div className="relative z-10">
                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <Target className="w-4 h-4" /> המטרה התקופתית
                            </h3>
                            <p className="text-text-secondary leading-relaxed font-medium">
                                {profile.period_goal}
                            </p>
                        </div>
                    )}
                </div>
            )}

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

            <ResourceBuilder initialProfile={profile} />
        </div>
    );
}

function ResourceBuilder({ initialProfile }: { initialProfile: UserProfile | null }) {
    const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
    const [strengthsInput, setStrengthsInput] = useState('');
    const [successInput, setSuccessInput] = useState('');
    const [activeTab, setActiveTab] = useState<'success' | 'strengths'>('success');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (!profile) setProfile(getProfile() as UserProfile);
    }, [profile]);

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
        saveProfile(updatedProfile as any);
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
        saveProfile(updatedProfile as any);
        setProfile(updatedProfile);
    };

    if (!profile) return null;

    const currentList = activeTab === 'strengths'
        ? (profile.personal_strengths || [])
        : (profile.success_bank || []);

    return (
        <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-lg shadow-primary/5 mt-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                    <h3 className="font-bold text-xl font-serif text-primary">ארסנל הכוחות (CBT)</h3>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 bg-surface-bg rounded-xl hover:bg-border-muted transition-colors"
                >
                    <Plus className="w-5 h-5 text-text-secondary" />
                </button>
            </div>

            <p className="text-sm text-text-secondary mb-6">
                המאגר הזה נבנה אוטומטית מיומני הערב שלך, ומשמש את המערכת כדי להזכיר לך את היכולות שלך בבוקר.
            </p>

            <div className="flex bg-surface-bg p-1 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab('success')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'success' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    ההצלחות שלי
                </button>
                <button
                    onClick={() => setActiveTab('strengths')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'strengths' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    יכולות שהפעלתי
                </button>
            </div>

            {isAdding && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 mb-6">
                    <textarea
                        className="w-full p-4 rounded-xl border border-border-muted h-24 resize-none focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-surface-bg"
                        placeholder={activeTab === 'strengths' ? "הוסף יכולת ידנית..." : "הוסף הצלחה ידנית..."}
                        value={activeTab === 'strengths' ? strengthsInput : successInput}
                        onChange={e => activeTab === 'strengths' ? setStrengthsInput(e.target.value) : setSuccessInput(e.target.value)}
                    />
                    <button
                        onClick={() => handleAdd(activeTab)}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        שמור במאגר
                    </button>
                </motion.div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {currentList.length === 0 && (
                    <div className="text-center text-sm text-text-muted py-8 border-2 border-dashed border-border-muted rounded-xl">
                        המאגר ריק. מלא את היומן בערב כדי לבנות אותו!
                    </div>
                )}
                {currentList.map((item: string, idx: number) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className="flex justify-between items-center p-4 bg-surface-bg border border-border-muted/50 rounded-2xl group hover:border-primary/30 transition-colors"
                    >
                        <span className="text-sm font-medium text-text-primary leading-relaxed">{item}</span>
                        <button
                            onClick={() => handleDelete(activeTab, idx)}
                            className="text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 -ml-2"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
