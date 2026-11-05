'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { isEveningHour } from '@/lib/dates';
import type { StoryVariant } from '@/lib/share/story';

/** The quiet flame used while the AI writes, and in the breathing exercise. */
export function Flame({ scale = 1, className = 'w-10' }: { scale?: number; className?: string }) {
    return (
        <svg viewBox="-12 -22 24 26" className={`${className} overflow-visible`} aria-hidden>
            <defs>
                <radialGradient id="single-flame" cx="50%" cy="72%" r="65%">
                    <stop offset="0" stopColor="var(--flame-core)" />
                    <stop offset="0.45" stopColor="var(--flame-bright)" />
                    <stop offset="1" stopColor="var(--flame)" stopOpacity="0.15" />
                </radialGradient>
            </defs>
            <motion.g animate={{ scale }} transition={{ duration: 1, ease: 'easeInOut' }} style={{ originX: '50%', originY: '100%' }}>
                <path className="flame" d="M0,-17 C4.5,-10 5,-4 0,0 C-5,-4 -4.5,-10 0,-17 Z" fill="url(#single-flame)" />
            </motion.g>
        </svg>
    );
}

export function Writing({ text }: { text: string }) {
    return (
        <div className="flex flex-col items-center gap-4 py-12" role="status">
            <Flame className="w-12" />
            <p className="text-sacred text-lg text-text-secondary">{text}</p>
        </div>
    );
}

export function MomentHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-text-secondary">{subtitle}</p>
        </div>
    );
}

/** Which story palette fits right now. */
export function storyVariant(todayIndex: number): StoryVariant {
    if (todayIndex === 6) return 'shabbat';
    return isEveningHour(new Date().getHours()) ? 'night' : 'day';
}

/** The text, line by line, in the serif of the book. */
export function SacredText({ text, className = '' }: { text: string; className?: string }) {
    return (
        <div className={`font-serif text-xl leading-[1.9] text-text-primary space-y-1 ${className}`}>
            {text.split('\n').filter(Boolean).map((l, i) => (
                <p key={i}>{l}</p>
            ))}
        </div>
    );
}
