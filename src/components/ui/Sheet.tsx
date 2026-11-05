'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

/** A bottom sheet on phones, a centered card on wider screens. Wrap in <AnimatePresence>. */
export default function Sheet({
    title,
    onClose,
    children,
}: {
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
            <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.div
                className="relative w-full sm:max-w-md max-h-[90dvh] overflow-y-auto bg-app-bg rounded-t-3xl sm:rounded-3xl shadow-2xl safe-bottom"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-4 pb-2 bg-app-bg">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="btn-quiet !p-2" aria-label="סגירה">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-5 pb-6">{children}</div>
            </motion.div>
        </div>
    );
}
