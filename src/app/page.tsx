'use client';

import { useEffect, useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import Menorah from '@/components/menorah/Menorah';
import { dayIndex, localDateStr } from '@/lib/dates';

const MOMENTS = [
    { name: 'שחרית', text: 'דקה בבוקר לכוון את היום אל הכוכב שלך' },
    { name: 'מנחה', text: 'עצירה קטנה באמצע הרעש, וחזרה' },
    { name: 'ערבית', text: 'לאסוף את הטוב של היום ולהצהיר על מה שיש' },
];

export default function Home() {
    const router = useRouter();
    const { user, loading } = useAuth();
    // The day comes from the visitor's own clock, so it is read only in the browser.
    const today = useSyncExternalStore(noopSubscribe, () => dayIndex(localDateStr()), () => -1);
    useEffect(() => {
        if (!loading && user) router.replace('/dashboard');
    }, [user, loading, router]);

    return (
        <main className="min-h-dvh flex flex-col items-center px-6 py-12 max-w-md mx-auto">
            <div className="flex-1 flex flex-col items-center justify-center gap-10 w-full">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                    <Menorah litThrough={today} levels={Array(7).fill(1)} className="w-48" />
                </motion.div>

                <div className="text-center space-y-3">
                    <h1 className="text-6xl font-bold">כוונה</h1>
                    <p className="text-xl text-text-secondary">התכווננות יומית, במינימום זמן</p>
                </div>

                <ol className="w-full space-y-4">
                    {MOMENTS.map((m, i) => (
                        <motion.li
                            key={m.name}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.15 }}
                            className="flex items-baseline gap-4"
                        >
                            <span className="font-serif text-xl font-bold w-16 shrink-0">{m.name}</span>
                            <span className="text-text-secondary leading-relaxed">{m.text}</span>
                        </motion.li>
                    ))}
                </ol>

                <p className="text-center text-text-secondary leading-relaxed">
                    שלושה רגעים ביום, שבעה נרות בשבוע.
                    <br />
                    בכל יום נדלק נר, ובשבת המנורה שלמה.
                </p>

                <Link href="/login" className="btn-primary w-full text-lg flex items-center justify-center gap-2">
                    להדליק את הנר הראשון
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>

            <div className="flex gap-4 text-sm text-text-muted pt-10">
                <Link href="/about">על כוונה</Link>
                <Link href="/privacy">מדיניות פרטיות</Link>
            </div>
        </main>
    );
}
