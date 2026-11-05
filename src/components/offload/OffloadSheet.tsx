'use client';

import React, { useState } from 'react';
import { Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import Sheet from '@/components/ui/Sheet';
import { api } from '@/lib/api-client';
import { localDateStr } from '@/lib/dates';
import { sendTelemetry } from '@/lib/admin';
import type { Offload } from '@/lib/types';

/**
 * Offload: write whatever is on the heart. The answer listens and asks
 * one question; it never advises. In distress it points to human help.
 */
export default function OffloadSheet({ onClose, onDone }: { onClose: () => void; onDone?: () => void }) {
    const [content, setContent] = useState('');
    const [busy, setBusy] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
    const [support, setSupport] = useState<string | null>(null);

    const send = async () => {
        if (!content.trim()) return;
        setBusy(true);
        try {
            const res = await api<{ offload: Offload; support: string | null }>('/api/offload', { date: localDateStr(), content });
            setAnswer(res.offload.ai_response || 'הקשבתי. תודה ששיתפת.');
            setSupport(res.support);
            sendTelemetry('offload_done', { distress: !!res.support });
        } catch {
            toast.error('לא הצלחנו לשלוח. מה שכתבת עדיין כאן.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Sheet title="פריקה" onClose={onClose}>
            {answer === null ? (
                <div className="space-y-4">
                    <p className="text-text-secondary">פשוט להוציא את מה שעל הלב. בלי שיפוט, בלי סדר.</p>
                    <textarea
                        className="input w-full h-44 resize-none text-lg"
                        placeholder="מה יושב עליך עכשיו?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={5000}
                        autoFocus
                    />
                    <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={send} disabled={busy || !content.trim()}>
                        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'לשחרר'}
                    </button>
                    <p className="text-xs text-text-muted text-center">הפריקות נשמרות רק אצלך, ומזינות את זיהוי הדפוסים במגילה השבועית.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    <p className="font-serif text-xl leading-relaxed">{answer}</p>
                    {support && (
                        <div className="rounded-2xl border border-accent-active/40 bg-accent-active/10 p-4 space-y-3">
                            <p className="leading-relaxed">{support}</p>
                            <a href="tel:1201" className="btn-primary inline-flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                חיוג לער&quot;ן 1201
                            </a>
                        </div>
                    )}
                    <button className="btn-primary w-full" onClick={onDone || onClose}>
                        תודה
                    </button>
                </div>
            )}
        </Sheet>
    );
}
