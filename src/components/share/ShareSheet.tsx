'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Download, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import Sheet from '@/components/ui/Sheet';
import { drawStory, StoryVariant } from '@/lib/share/story';
import { updateProfile } from '@/lib/storage';
import { sendTelemetry } from '@/lib/admin';
import type { ShareLines, ShareStyle } from '@/lib/types';

const STYLE_LABELS: Record<ShareStyle, string> = { mantra: 'מנטרה', choice: 'בחירה', source: 'מקור' };

/**
 * "The line of the day" as a story card. The personal kavana never leaves the app:
 * only these lines, written without any personal detail, can be shared.
 */
export default function ShareSheet({
    lines,
    preferred,
    kicker,
    litThrough,
    levels,
    variant,
    moment,
    onClose,
}: {
    lines: ShareLines;
    preferred: ShareStyle;
    kicker: string;
    litThrough: number;
    levels: number[];
    variant: StoryVariant;
    moment: string;
    onClose: () => void;
}) {
    const styles = useMemo(() => (['mantra', 'choice', 'source'] as ShareStyle[]).filter((s) => !!lines[s]), [lines]);
    const [style, setStyle] = useState<ShareStyle>(styles.includes(preferred) ? preferred : styles[0]);
    const [blob, setBlob] = useState<Blob | null>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!style) return;
        let cancelled = false;
        let objectUrl: string | null = null;
        setBlob(null);
        drawStory({
            line: lines[style] || '',
            reference: style === 'source' ? lines.source_ref : undefined,
            kicker,
            litThrough,
            levels,
            variant,
            site: window.location.host,
        })
            .then((b) => {
                if (cancelled) return;
                objectUrl = URL.createObjectURL(b);
                setBlob(b);
                setUrl(objectUrl);
            })
            .catch(() => toast.error('לא הצלחנו ליצור את התמונה'));
        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [style, lines, kicker, litThrough, levels, variant]);

    if (!styles.length) {
        return (
            <Sheet title="משפט היום" onClose={onClose}>
                <p className="text-text-secondary">אין עדיין משפט לשיתוף לרגע הזה.</p>
            </Sheet>
        );
    }

    const remember = () => {
        sendTelemetry('share', { style, moment });
        if (style !== preferred) updateProfile({ share_style: style }).catch(() => undefined);
    };

    const share = async () => {
        if (!blob) return;
        setBusy(true);
        const file = new File([blob], 'kavana.png', { type: 'image/png' });
        try {
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file] });
                remember();
            } else {
                download();
            }
        } catch (e) {
            if ((e as Error).name !== 'AbortError') download();
        } finally {
            setBusy(false);
        }
    };

    const download = () => {
        if (!url) return;
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kavana.png';
        a.click();
        remember();
    };

    return (
        <Sheet title="משפט היום" onClose={onClose}>
            <div className="space-y-5">
                <div className="flex gap-2 justify-center" role="tablist">
                    {styles.map((s) => (
                        <button key={s} role="tab" aria-selected={s === style} className="chip !py-2 !px-4" onClick={() => setStyle(s)}>
                            {STYLE_LABELS[s]}
                        </button>
                    ))}
                </div>

                <div className="mx-auto w-48 aspect-[9/16] rounded-2xl overflow-hidden shadow-lg bg-card flex items-center justify-center">
                    {url && blob ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={lines[style]} className="w-full h-full object-cover" />
                    ) : (
                        <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
                    )}
                </div>

                <p className="text-center text-sm text-text-secondary">
                    המשפט נכתב בלי שום פרט אישי. הכוונה שלך נשארת רק אצלך.
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <button className="btn-primary flex items-center justify-center gap-2" onClick={share} disabled={!blob || busy}>
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                        שיתוף
                    </button>
                    <button className="btn-quiet border border-accent-border/40 flex items-center justify-center gap-2" onClick={download} disabled={!blob}>
                        <Download className="w-4 h-4" />
                        שמירה
                    </button>
                </div>
            </div>
        </Sheet>
    );
}
