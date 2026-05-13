'use client';

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { translations, Language } from '../utils/translations';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.en;
    dir: 'rtl' | 'ltr';
    isChangingLanguage: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: React.ReactNode;
    initialLanguage?: Language;
}

export function LanguageProvider({ children, initialLanguage = 'en' }: LanguageProviderProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
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
        
        startTransition(() => {
            router.refresh();
        });
    };

    const t = translations[language];
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir, isChangingLanguage: isPending }}>
            <div className={language === 'ar' ? 'font-sans-ar text-right' : 'font-sans-en text-left'}>
                {children}
            </div>
            
            {/* Loading overlay during language change */}
            {isPending && (
                <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-200">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-accent font-bold">
                            {language === 'ar' ? 'جاري التحديث...' : 'Updating...'}
                        </p>
                    </div>
                </div>
            )}
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
