"use client";

import React from 'react';
import { getDailyContext } from '@/lib/ai/calendar-context';

export default function DateDisplay() {
    const context = getDailyContext();
    const now = new Date();

    // Format civil date
    const civilDate = now.toLocaleDateString('he-IL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="flex flex-col items-center justify-center space-y-1.5 py-2">
            <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {context.hebrewDateString}
            </div>
            <div className="text-xs text-text-muted flex items-center gap-2">
                <span>{civilDate}</span>
                {context.weeklyEnergy?.name && (
                    <>
                        <span className="w-1 h-1 rounded-full bg-text-muted/50" />
                        <span>{context.weeklyEnergy.name}</span>
                    </>
                )}
            </div>
        </div>
    );
}
