'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isEveningHour } from '@/lib/dates';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    mode: ThemeMode;
    isDark: boolean;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const KEY = 'kavana_theme_mode';

function readSavedMode(): ThemeMode {
    if (typeof window === 'undefined') return 'auto';
    try {
        const saved = localStorage.getItem(KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
    } catch {
        // storage may be blocked; auto is fine
    }
    return 'auto';
}

/** Night falls by itself in the evening ("auto"), unless the user chose otherwise. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>(readSavedMode);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const apply = () => {
            const dark = mode === 'dark' || (mode === 'auto' && isEveningHour(new Date().getHours()));
            setIsDark(dark);
            document.documentElement.classList.toggle('dark', dark);
        };
        apply();
        if (mode !== 'auto') return;
        const t = setInterval(apply, 60_000);
        return () => clearInterval(t);
    }, [mode]);

    const setMode = (m: ThemeMode) => {
        setModeState(m);
        try {
            localStorage.setItem(KEY, m);
        } catch {
            // ignore
        }
    };

    return <ThemeContext.Provider value={{ mode, isDark, setMode }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
