"use client";

import React, { useState, useEffect } from 'react';
import { getPendingAlerts, resolveAlert, AdminAlert } from '@/lib/admin';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            loadAlerts();
        }
    }, [isAuthenticated]);

    const loadAlerts = async () => {
        setLoading(true);
        const data = await getPendingAlerts();
        setAlerts(data);
        setLoading(false);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded password for the local admin
        if (password === 'kavana-admin-2026') {
            setIsAuthenticated(true);
        } else {
            alert('סיסמה שגויה / Incorrect Password');
        }
    };

    const handleResolve = async (id: string) => {
        await resolveAlert(id);
        setAlerts(alerts.filter(a => a.id !== id));
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="sacred-card p-8 max-w-sm w-full space-y-6">
                    <div className="text-center">
                        <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
                        <h1 className="text-2xl font-bold">Admin Portal</h1>
                        <p className="text-sm text-text-secondary">Kavana Culture Management</p>
                    </div>
                    <input
                        type="password"
                        placeholder="Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input w-full"
                    />
                    <button type="submit" className="btn-primary w-full">Enter</button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app-bg p-8" dir="ltr">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Shield className="w-8 h-8 text-primary" />
                            Admin Dashboard
                        </h1>
                        <p className="text-text-secondary mt-2">Manage unhandled culture & belief system requests</p>
                    </div>
                    <button onClick={loadAlerts} className="btn-ghost px-4 py-2">Refresh</button>
                </header>

                <main className="sacred-card p-6">
                    {loading ? (
                        <div className="py-20 text-center text-text-secondary">Loading alerts...</div>
                    ) : alerts.length === 0 ? (
                        <div className="py-20 text-center text-text-secondary flex flex-col items-center gap-4">
                            <CheckCircle className="w-12 h-12 text-green-500/50" />
                            <p>All clear! No pending culture requests.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map(alert => (
                                <div key={alert.id} className="border border-red-100 bg-red-50/50 p-4 rounded-xl flex justify-between items-center">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-red-500">{alert.type.replace('_', ' ')}</span>
                                            <span className="text-xs text-text-secondary ml-4">{new Date(alert.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-lg font-medium text-text-primary">"{alert.content}"</p>
                                        <p className="text-xs text-text-secondary">User ID: {alert.user_id}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleResolve(alert.id)}
                                        className="bg-white border shadow-sm px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                                    >
                                        Mark Resolved
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
