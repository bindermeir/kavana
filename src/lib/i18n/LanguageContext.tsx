"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './dictionaries/en';
import { he } from './dictionaries/he';
import { getProfile, saveProfile, UserProfile } from '../storage';

type Language = 'he' | 'en';
type Dictionary = typeof he;

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: Dictionary;
    dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>('he');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load language from profile
        const loadLang = async () => {
            const profile = await getProfile();
            if (profile && profile.language) {
                setLangState(profile.language);
                document.documentElement.lang = profile.language;
                document.documentElement.dir = profile.language === 'he' ? 'rtl' : 'ltr';
            }
            setIsLoaded(true);
        };
        loadLang();
    }, []);

    const setLang = async (newLang: Language) => {
        setLangState(newLang);
        document.documentElement.lang = newLang;
        document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
        
        // Save to profile
        const profile = await getProfile();
        if (profile) {
            await saveProfile({ ...profile, language: newLang });
        }
    };

    const t = lang === 'he' ? he : en;
    const dir = lang === 'he' ? 'rtl' : 'ltr';

    // Prevent hydration mismatch by not rendering until language is determined
    if (!isLoaded) return <div className="min-h-screen bg-app-bg"></div>;

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
