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

interface LanguageProviderProps {
    children: React.ReactNode;
    initialLanguage?: Language;
}

export function LanguageProvider({ children, initialLanguage = 'en' }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>(initialLanguage);

    // On mount, sync localStorage → cookie. If they differ from server, update state.
    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang === 'ar' || savedLang === 'en') {
            if (savedLang !== language) {
                setLanguageState(savedLang);
                document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = savedLang;
            }
            // Keep cookie in sync with localStorage
            document.cookie = `language=${savedLang};path=/;max-age=${60 * 60 * 24 * 30}`;
        } else {
            // First visit — persist server-detected language to localStorage
            localStorage.setItem('language', language);
            document.cookie = `language=${language};path=/;max-age=${60 * 60 * 24 * 30}`;
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        document.cookie = `language=${lang};path=/;max-age=${60 * 60 * 24 * 30}`;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        window.location.reload();
    };

    const t = translations[language];
    const dir = language === 'ar' ? 'rtl' : 'ltr';

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
