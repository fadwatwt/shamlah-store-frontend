'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { getCookieChannel } from '@/lib/saleor/channel-mapping';
import type { Language } from '../utils/translations';

const CURRENCIES = [
    { code: 'USD', symbol: '$', channel: 'global-usd' },
    { code: 'EUR', symbol: '€', channel: 'eu-eur' },
    { code: 'TRY', symbol: '₺', channel: 'tr-try' },
];
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function setCookieChannel(nextChannel: string) {
    if (typeof document !== 'undefined') {
        document.cookie = `saleor-channel=${nextChannel};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
    }
}

// Slim utility strip (like most stores): manual language + currency override.
// The automatic geo system keeps working internally — middleware sets the
// cookie on first display when it's absent; a manual pick persists and wins.
export default function LocaleBar() {
    const { language, setLanguage, dir } = useLanguage();
    const { clearCart } = useCart();
    const router = useRouter();
    const [openMenu, setOpenMenu] = useState<'lang' | 'currency' | null>(null);
    const [channel, setChannel] = useState<string>('global-usd');
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setChannel(getCookieChannel() || process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'global-usd');
    }, []);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenMenu(null);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpenMenu(null);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    const activeCurrency = CURRENCIES.find((c) => c.channel === channel) || CURRENCIES[0];

    const pickLanguage = (lang: Language) => {
        setOpenMenu(null);
        if (lang !== language) setLanguage(lang);
    };

    const pickCurrency = (nextChannel: string) => {
        setOpenMenu(null);
        if (nextChannel === channel) return;
        setCookieChannel(nextChannel);
        setChannel(nextChannel);
        // Saleor checkouts are channel-locked: a USD checkout cannot take EUR
        // lines, so the old cart must restart in the new currency.
        clearCart();
        router.refresh();
    };

    const menuClass =
        'absolute top-full end-0 min-w-[132px] bg-white text-gray-800 rounded-b-md shadow-xl border border-gray-100 py-1 z-50';
    const itemClass =
        'w-full flex items-center justify-between gap-2 px-4 py-2 text-xs hover:bg-gray-50 hover:text-accent transition-colors text-start';

    // Dropdowns must paint above the header below (same region) → z-[60].
    return (
        <div ref={rootRef} dir={dir} translate="no" className="fixed top-0 inset-x-0 z-[60] h-8 bg-accent text-white/90 text-[11px] notranslate">
            <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-end">
                {/* Language */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setOpenMenu(openMenu === 'lang' ? null : 'lang')}
                        aria-haspopup="listbox"
                        aria-expanded={openMenu === 'lang'}
                        aria-label="Language"
                        className="flex items-center gap-1 px-2 h-8 hover:text-white transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-2.5 3.5-5.5 3.5-9S14.5 5.5 12 3C9.5 5.5 8.5 8.5 8.5 12s1 6.5 3.5 9zM3.5 9h17M3.5 15h17" />
                        </svg>
                        <span>{language === 'ar' ? 'العربية' : 'English'}</span>
                        <svg className={`w-3 h-3 transition-transform ${openMenu === 'lang' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {openMenu === 'lang' && (
                        <ul className={menuClass} role="listbox">
                            {(['ar', 'en'] as Language[]).map((lang) => (
                                <li key={lang} role="option" aria-selected={language === lang}>
                                    <button type="button" onClick={() => pickLanguage(lang)} className={itemClass}>
                                        <span>{lang === 'ar' ? 'العربية' : 'English'}</span>
                                        {language === lang && (
                                            <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <span className="text-white/25 select-none">|</span>

                {/* Currency */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setOpenMenu(openMenu === 'currency' ? null : 'currency')}
                        aria-haspopup="listbox"
                        aria-expanded={openMenu === 'currency'}
                        aria-label="Currency"
                        className="flex items-center gap-1 px-2 h-8 hover:text-white transition-colors"
                    >
                        <span className="font-semibold">{activeCurrency.symbol}</span>
                        <span>{activeCurrency.code}</span>
                        <svg className={`w-3 h-3 transition-transform ${openMenu === 'currency' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {openMenu === 'currency' && (
                        <ul className={menuClass} role="listbox">
                            {CURRENCIES.map((c) => (
                                <li key={c.code} role="option" aria-selected={c.channel === channel}>
                                    <button type="button" onClick={() => pickCurrency(c.channel)} className={itemClass}>
                                        <span>{c.symbol} {c.code}</span>
                                        {c.channel === channel && (
                                            <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
