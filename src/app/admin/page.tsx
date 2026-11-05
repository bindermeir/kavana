'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart2, Book, CheckCircle, Loader2, MessageSquare, Settings, Shield, Trash2, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api-client';

type Tab = 'alerts' | 'cultures' | 'prompt' | 'feedback' | 'telemetry';

interface Alert { id: string; type: string; content: string; created_at: string }
interface Culture { id: string; name: string; type: string }
interface Feedback { id: string; content_type: string; generated_text: string | null; feedback_score: number; created_at: string }

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'alerts', label: 'התראות', icon: TriangleAlert },
    { id: 'cultures', label: 'תרבויות', icon: Book },
    { id: 'prompt', label: 'הנחיה ל-AI', icon: Settings },
    { id: 'feedback', label: 'משוב', icon: MessageSquare },
    { id: 'telemetry', label: 'שימוש', icon: BarChart2 },
];

const get = <T,>(what: string) => api<{ data: T }>(`/api/admin?what=${what}`, undefined, 'GET').then((r) => r.data);
const post = (body: Record<string, unknown>) => api('/api/admin', body);

/**
 * Admin. Access is decided on the server: the signed-in user's email
 * must be listed in ADMIN_EMAILS. There is no password in the code.
 */
export default function AdminPage() {
    const { user, loading } = useAuth();
    const [allowed, setAllowed] = useState<boolean | null>(null);
    const [tab, setTab] = useState<Tab>('alerts');
    const [busy, setBusy] = useState(false);

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [cultures, setCultures] = useState<Culture[]>([]);
    const [prompt, setPrompt] = useState('');
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [stats, setStats] = useState<{ type: string; count: number }[]>([]);
    const [newCulture, setNewCulture] = useState('');

    useEffect(() => {
        if (loading) return;
        if (!user) return setAllowed(false);
        get<boolean>('me').then(() => setAllowed(true)).catch(() => setAllowed(false));
    }, [user, loading]);

    const load = useCallback(async () => {
        setBusy(true);
        try {
            if (tab === 'alerts') setAlerts(await get<Alert[]>('alerts'));
            if (tab === 'cultures') setCultures(await get<Culture[]>('cultures'));
            if (tab === 'prompt') setPrompt(await get<string>('config'));
            if (tab === 'feedback') setFeedback(await get<Feedback[]>('feedback'));
            if (tab === 'telemetry') setStats(await get<{ type: string; count: number }[]>('telemetry'));
        } catch {
            toast.error('טעינה נכשלה');
        } finally {
            setBusy(false);
        }
    }, [tab]);

    useEffect(() => {
        if (allowed) load();
    }, [allowed, load]);

    if (allowed === null) {
        return <div className="min-h-dvh flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent-active" /></div>;
    }

    if (!allowed) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
                <Shield className="w-12 h-12 text-text-muted" />
                <h1 className="text-2xl font-bold">אין גישה</h1>
                <p className="text-text-secondary">הדף הזה פתוח רק לצוות כוונה.</p>
                <Link href={user ? '/dashboard' : '/login'} className="btn-primary">{user ? 'חזרה' : 'כניסה'}</Link>
            </div>
        );
    }

    return (
        <div className="min-h-dvh max-w-4xl mx-auto px-4 py-8 space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="w-7 h-7" /> ניהול</h1>
                <Link href="/dashboard" className="btn-quiet">לאפליקציה</Link>
            </header>

            <nav className="flex flex-wrap gap-2">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button key={id} className="chip flex items-center gap-2 !py-2" aria-pressed={tab === id} onClick={() => setTab(id)}>
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
            </nav>

            <section className="sacred-card min-h-64">
                {busy ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-text-muted" />
                ) : tab === 'alerts' ? (
                    alerts.length === 0 ? <p className="text-text-secondary">אין התראות פתוחות.</p> : (
                        <ul className="space-y-3">
                            {alerts.map((a) => (
                                <li key={a.id} className="flex items-center justify-between gap-3 border-b border-accent-border/20 pb-3">
                                    <div>
                                        <p className="font-medium">{a.content}</p>
                                        <p className="text-xs text-text-muted">{a.type === 'custom_belief' ? 'אמונה' : 'תרבות'} · {new Date(a.created_at).toLocaleDateString('he-IL')}</p>
                                    </div>
                                    <button className="btn-quiet flex items-center gap-1 text-sm" onClick={async () => { await post({ action: 'resolveAlert', id: a.id }); setAlerts(alerts.filter((x) => x.id !== a.id)); }}>
                                        <CheckCircle className="w-4 h-4" /> טופל
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )
                ) : tab === 'cultures' ? (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input className="input flex-1" placeholder="שם תרבות חדשה" value={newCulture} onChange={(e) => setNewCulture(e.target.value)} />
                            <button className="btn-primary !py-2" disabled={!newCulture.trim()} onClick={async () => { await post({ action: 'addCulture', name: newCulture }); setNewCulture(''); load(); }}>הוספה</button>
                        </div>
                        <ul className="space-y-2">
                            {cultures.map((c) => (
                                <li key={c.id} className="flex items-center justify-between border-b border-accent-border/20 pb-2">
                                    <span>{c.name}</span>
                                    <button className="btn-quiet !p-2" aria-label={`מחיקת ${c.name}`} onClick={async () => { if (confirm(`למחוק את ${c.name}?`)) { await post({ action: 'deleteCulture', id: c.id }); load(); } }}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : tab === 'prompt' ? (
                    <div className="space-y-4">
                        <p className="text-sm text-text-secondary">הנחיה נוספת שמצורפת לכל יצירה של ה-AI, לכל המשתמשים. שינוי כאן משפיע מיד.</p>
                        <textarea className="input w-full h-64 font-mono text-sm" dir="auto" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={4000} />
                        <button className="btn-primary" onClick={async () => { await post({ action: 'setConfig', value: prompt }); toast.success('נשמר'); }}>שמירה</button>
                    </div>
                ) : tab === 'feedback' ? (
                    feedback.length === 0 ? <p className="text-text-secondary">אין משוב עדיין.</p> : (
                        <ul className="space-y-4">
                            {feedback.map((f) => (
                                <li key={f.id} className="border-b border-accent-border/20 pb-3 space-y-1">
                                    <p className="text-sm">{f.feedback_score > 0 ? '👍' : '👎'} · {f.content_type} · {new Date(f.created_at).toLocaleDateString('he-IL')}</p>
                                    <p className="text-sm text-text-secondary whitespace-pre-wrap line-clamp-4">{f.generated_text}</p>
                                </li>
                            ))}
                        </ul>
                    )
                ) : (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {stats.map((s) => (
                            <li key={s.type} className="rounded-xl bg-app-bg p-4">
                                <p className="text-3xl font-bold">{s.count}</p>
                                <p className="text-sm text-text-secondary">{s.type}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
