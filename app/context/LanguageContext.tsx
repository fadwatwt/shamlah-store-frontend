'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../utils/translations';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.en;
    dir: 'rtl' | 'ltr';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en'); // Default to English
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
            setLanguageState(savedLang);
            document.cookie = `language=${savedLang};path=/;max-age=${60 * 60 * 24 * 30}`; // 30 days
        }
        setMounted(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        document.cookie = `language=${lang};path=/;max-age=${60 * 60 * 24 * 30}`; // 30 days
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        window.location.reload();
    };

    // Update direction on mount/change
    useEffect(() => {
        if (mounted) {
            document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = language;
        }
    }, [language, mounted]);

    const t = translations[language];
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    if (!mounted) {
        return (
            <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
                {/* Prevent hydration mismatch by hiding content until mounted */}
                <div style={{ visibility: 'hidden' }}>{children}</div>
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
            <div className={language === 'ar' ? 'font-sans-ar' : 'font-sans-en'}>
                {children}
            </div>
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
