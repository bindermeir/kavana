"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    mode: ThemeMode;
    isDark: boolean;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>('auto');
    const [isDark, setIsDark] = useState(false);

    // Load saved preference
    useEffect(() => {
        const saved = localStorage.getItem('kavana_theme_mode') as ThemeMode;
        if (saved && ['light', 'dark', 'auto'].includes(saved)) {
            setModeState(saved);
        }
    }, []);

    // Apply theme based on mode
    useEffect(() => {
        const applyTheme = () => {
            let shouldBeDark = false;

            if (mode === 'dark') {
                shouldBeDark = true;
            } else if (mode === 'light') {
                shouldBeDark = false;
            } else {
                // Auto mode - based on time
                const hour = new Date().getHours();
                shouldBeDark = hour >= 18 || hour < 6;
            }

            setIsDark(shouldBeDark);

            if (shouldBeDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        applyTheme();

        // For auto mode, check every minute
        if (mode === 'auto') {
            const interval = setInterval(applyTheme, 60000);
            return () => clearInterval(interval);
        }
    }, [mode]);

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        localStorage.setItem('kavana_theme_mode', newMode);
    };

    return (
        <ThemeContext.Provider value={{ mode, isDark, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
