'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useCategoriesContext } from '../context/CategoriesContext';
import { formatPrice, AR_LATN_LOCALE } from '@/lib/utils/formatPrice';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface LiveProduct {
    id: string;
    name: string;
    price: number;
    currency: string;
    image: string | null;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const { t, language, dir } = useLanguage();
    const router = useRouter();
    const categories = useCategoriesContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [liveProducts, setLiveProducts] = useState<LiveProduct[]>([]);
    const [searching, setSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        setSearchQuery('');
        setLiveProducts([]);
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const t = setTimeout(() => inputRef.current?.focus(), 50);
        return () => {
            document.body.style.overflow = original;
            clearTimeout(t);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    // Live product results — debounced fetch on every keystroke
    useEffect(() => {
        if (!isOpen) return;
        const q = searchQuery.trim();
        if (!q) {
            setLiveProducts([]);
            setSearching(false);
            return;
        }
        setSearching(true);
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(q)}&lang=${language}`,
                    { signal: controller.signal }
                );
                const data = await res.json();
                setLiveProducts(data.products || []);
            } catch (err: any) {
                if (err?.name !== 'AbortError') setLiveProducts([]);
            } finally {
                setSearching(false);
            }
        }, 250);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchQuery, language, isOpen]);

    if (!isOpen || !mounted) return null;

    const trimmedQuery = searchQuery.trim().toLowerCase();

    // Categories matching the typed word (checked in both languages + slug),
    // e.g. "خزف" or "ceramic" routes straight to the Ceramics category page.
    const matchedCategories = trimmedQuery
        ? (categories || []).filter((c) => {
            const names = [c.name, c.translation?.name, c.slug]
                .filter(Boolean)
                .map((n) => (n as string).toLowerCase());
            return names.some((n) => n === trimmedQuery || n.includes(trimmedQuery));
        }).slice(0, 5)
        : [];

    const goToCategory = (slug: string) => {
        router.push(`/category/${slug}`);
        onClose();
    };

    const goToProductsSearch = (q: string) => {
        router.push(`/products?search=${encodeURIComponent(q)}`);
        onClose();
    };

    const goToProduct = (id: string) => {
        router.push(`/products/${id}`);
        onClose();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        // Exact category match wins — user lands where the word points.
        const exact = (categories || []).find((c) => {
            const names = [c.name, c.translation?.name, c.slug]
                .filter(Boolean)
                .map((n) => (n as string).toLowerCase());
            return names.some((n) => n === q.toLowerCase());
        });
        if (exact) goToCategory(exact.slug);
        else if (matchedCategories.length === 1) goToCategory(matchedCategories[0].slug);
        else goToProductsSearch(q);
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-start pt-20 justify-center p-4 animate-in fade-in duration-200"
            dir={dir}
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-2xl p-8 md:p-10 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900 font-serif">
                        {t.header.searchTitle}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
                        className="p-2 text-gray-500 hover:text-accent transition-colors rounded-full hover:bg-gray-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-colors">
                        <input
                            ref={inputRef}
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.header.searchPlaceholder}
                            className="w-full py-4 px-4 outline-none text-gray-800 placeholder-gray-400 bg-transparent text-lg"
                        />
                        <button
                            type="submit"
                            className="px-6 text-gray-500 hover:text-accent transition-colors"
                            aria-label={t.header.searchTitle}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                            </svg>
                        </button>
                    </div>
                </form>

                {/* Live suggestions */}
                {trimmedQuery && (
                    <div className="mb-6 max-h-[40vh] overflow-y-auto divide-y divide-gray-100">
                        {searching && liveProducts.length === 0 && (
                            <div className="flex items-center justify-center py-6">
                                <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                            </div>
                        )}
                        {/* Matching products — tap goes straight to the product page */}
                        {liveProducts.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => goToProduct(p.id)}
                                className="w-full flex items-center gap-4 py-3 text-start group"
                            >
                                <span className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                    {p.image ? (
                                        <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" unoptimized />
                                    ) : (
                                        <span className="w-full h-full flex items-center justify-center text-gray-300 text-xs">SHMLH</span>
                                    )}
                                </span>
                                <span className="flex-1 min-w-0">
                                    <span className="block truncate text-gray-800 group-hover:text-accent transition-colors">
                                        {p.name}
                                    </span>
                                    <span className="block text-sm text-accent font-medium">
                                        {formatPrice(p.price, p.currency, language === 'ar' ? AR_LATN_LOCALE : 'en-US')}
                                    </span>
                                </span>
                            </button>
                        ))}
                        {matchedCategories.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => goToCategory(c.slug)}
                                className="w-full flex items-center justify-between py-3 text-start group"
                            >
                                <span className="text-gray-800 group-hover:text-accent transition-colors">
                                    {language === 'ar' ? (c.translation?.name || c.name) : c.name}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {language === 'ar' ? 'فئة' : 'Category'}
                                </span>
                            </button>
                        ))}
                        {!searching && liveProducts.length === 0 && matchedCategories.length === 0 && (
                            <p className="py-4 text-center text-sm text-gray-400">
                                {language === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results'}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => goToProductsSearch(searchQuery.trim())}
                            className="w-full flex items-center justify-between py-3 text-start group"
                        >
                            <span className="text-gray-800 group-hover:text-accent transition-colors">
                                {language === 'ar' ? `منتجات تطابق "${searchQuery.trim()}"` : `Products matching "${searchQuery.trim()}"`}
                            </span>
                            <span className="text-xs text-gray-400">
                                {language === 'ar' ? 'بحث' : 'Search'}
                            </span>
                        </button>
                    </div>
                )}

                {/* Subtitle */}
                <p className="text-center text-gray-400 text-sm">
                    {t.header.searchSubtitle}
                </p>
            </div>
        </div>,
        document.body
    );
}
