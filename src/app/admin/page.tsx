"use client";

import React, { useState, useEffect } from 'react';
import { 
    getPendingAlerts, resolveAlert, AdminAlert,
    getDynamicCultures, saveDynamicCulture, deleteDynamicCulture, DynamicCulture,
    getSystemConfig, updateSystemConfig,
    getFeedbackLogs, UserFeedback,
    getTelemetryStats
} from '@/lib/admin';
import { Shield, CheckCircle, AlertTriangle, Settings, Book, BarChart2, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('alerts');

    // Data States
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);
    const [cultures, setCultures] = useState<DynamicCulture[]>([]);
    const [feedback, setFeedback] = useState<UserFeedback[]>([]);
    const [stats, setStats] = useState<{type: string, count: number}[]>([]);
    const [promptOverride, setPromptOverride] = useState('');
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [newCultureName, setNewCultureName] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated, activeTab]);

    const loadData = async () => {
        setLoading(true);
        if (activeTab === 'alerts') {
            setAlerts(await getPendingAlerts());
        } else if (activeTab === 'cultures') {
            setCultures(await getDynamicCultures());
        } else if (activeTab === 'prompt') {
            setPromptOverride(await getSystemConfig('global_ai_prompt_override') || '');
        } else if (activeTab === 'feedback') {
            setFeedback(await getFeedbackLogs());
        } else if (activeTab === 'telemetry') {
            setStats(await getTelemetryStats());
        }
        setLoading(false);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'kavana-admin-2026') {
            setIsAuthenticated(true);
        } else {
            alert('סיסמה שגויה');
        }
    };

    const handleResolveAlert = async (id: string) => {
        await resolveAlert(id);
        setAlerts(alerts.filter(a => a.id !== id));
    };

    const handleAddCulture = async () => {
        if (!newCultureName) return;
        await saveDynamicCulture(newCultureName, 'religion', []);
        setNewCultureName('');
        loadData();
    };

    const handleDeleteCulture = async (id: string) => {
        if (confirm('Are you sure?')) {
            await deleteDynamicCulture(id);
            loadData();
        }
    };

    const handleSavePrompt = async () => {
        await updateSystemConfig('global_ai_prompt_override', promptOverride);
        alert('Prompt saved!');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="sacred-card p-8 max-w-sm w-full space-y-6">
                    <div className="text-center">
                        <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
                        <h1 className="text-2xl font-bold">Admin Portal</h1>
                    </div>
                    <input type="password" placeholder="Admin Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input w-full" />
                    <button type="submit" className="btn-primary w-full">Enter</button>
                </form>
            </div>
        );
    }

    const tabs = [
        { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'cultures', label: 'Cultures', icon: <Book className="w-4 h-4" /> },
        { id: 'prompt', label: 'AI Tuning', icon: <Settings className="w-4 h-4" /> },
        { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'telemetry', label: 'Telemetry', icon: <BarChart2 className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-app-bg p-4 md:p-8" dir="ltr">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary" />
                        Kavana Control Center
                    </h1>
                    <button onClick={loadData} className="btn-ghost px-4 py-2">Refresh</button>
                </header>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {tabs.map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-primary text-white shadow-md' : 'bg-white text-text-secondary hover:bg-gray-50'}`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                <main className="sacred-card p-6 min-h-[500px]">
                    {loading ? (
                        <div className="py-20 text-center text-text-secondary">Loading...</div>
                    ) : (
                        <>
                            {/* ALERTS TAB */}
                            {activeTab === 'alerts' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold mb-6">Pending Alerts</h2>
                                    {alerts.length === 0 ? <p className="text-text-secondary">No pending alerts.</p> : alerts.map(alert => (
                                        <div key={alert.id} className="border border-red-100 bg-red-50/50 p-4 rounded-xl flex justify-between items-center">
                                            <div>
                                                <span className="text-xs font-bold uppercase text-red-500">{alert.type}</span>
                                                <p className="text-lg font-medium">"{alert.content}"</p>
                                                <p className="text-xs text-text-secondary">User: {alert.user_id}</p>
                                            </div>
                                            <button onClick={() => handleResolveAlert(alert.id)} className="btn-ghost bg-white">Resolve</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* CULTURES TAB */}
                            {activeTab === 'cultures' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">Dynamic Cultures Dictionary</h2>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="New Culture Name (e.g., Buddhism)" className="input flex-1" value={newCultureName} onChange={e => setNewCultureName(e.target.value)} />
                                        <button onClick={handleAddCulture} className="btn-primary px-6">Add</button>
                                    </div>
                                    <div className="space-y-2 mt-4">
                                        {cultures.map(c => (
                                            <div key={c.id} className="p-4 border rounded-xl flex justify-between items-center bg-gray-50/50">
                                                <span className="font-medium text-lg">{c.name}</span>
                                                <button onClick={() => handleDeleteCulture(c.id)} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded">Delete</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PROMPT TAB */}
                            {activeTab === 'prompt' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold">Global AI Prompt Override</h2>
                                    <p className="text-sm text-text-secondary mb-4">Leave empty to use hardcoded prompts. Any text here will be injected into all AI generations.</p>
                                    <textarea 
                                        className="w-full h-64 input font-mono text-sm" 
                                        value={promptOverride} 
                                        onChange={e => setPromptOverride(e.target.value)}
                                        placeholder="Enter strict system prompt override here..."
                                    />
                                    <button onClick={handleSavePrompt} className="btn-primary w-full">Save Global Override</button>
                                </div>
                            )}

                            {/* FEEDBACK TAB */}
                            {activeTab === 'feedback' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold mb-6">User Feedback Logs</h2>
                                    {feedback.length === 0 ? <p className="text-text-secondary">No feedback yet.</p> : feedback.map(f => (
                                        <div key={f.id} className="border p-4 rounded-xl space-y-2">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded uppercase">{f.content_type}</span>
                                                <span className="text-2xl">{f.feedback_score > 0 ? '👍' : '👎'}</span>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded text-sm font-medium">"{f.generated_text}"</div>
                                            {f.feedback_notes && <p className="text-sm text-red-600 font-bold">Note: {f.feedback_notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* TELEMETRY TAB */}
                            {activeTab === 'telemetry' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold mb-6">System Telemetry (Anonymous)</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {stats.map(s => (
                                            <div key={s.type} className="bg-primary/5 border border-primary/10 p-6 rounded-2xl text-center">
                                                <p className="text-3xl font-bold text-primary">{s.count}</p>
                                                <p className="text-xs font-bold text-text-secondary uppercase mt-2">{s.type.replace(/_/g, ' ')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
