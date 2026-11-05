'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Feather } from 'lucide-react';
import OffloadSheet from './OffloadSheet';

/** Always within reach, never demanding attention: no badges, no red dots. */
export default function OffloadButton() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed z-30 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-[max(1rem,calc(50%-15rem))] rounded-full w-12 h-12 flex items-center justify-center bg-card border border-accent-border/30 text-text-secondary shadow-md hover:text-accent-active transition-colors"
                aria-label="פריקה: להוציא את מה שעל הלב"
                title="פריקה"
            >
                <Feather className="w-5 h-5" />
            </button>
            <AnimatePresence>{open && <OffloadSheet onClose={() => setOpen(false)} />}</AnimatePresence>
        </>
    );
}
