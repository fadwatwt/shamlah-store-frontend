'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const { t, language, dir } = useLanguage();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        setSearchQuery('');
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

    if (!isOpen || !mounted) return null;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        router.push(`/products?search=${encodeURIComponent(q)}`);
        onClose();
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

                {/* Subtitle */}
                <p className="text-center text-gray-400 text-sm">
                    {t.header.searchSubtitle}
                </p>
            </div>
        </div>,
        document.body
    );
}
