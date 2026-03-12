'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LanguageOption {
    code: string;
    name: string;
    nativeName: string;
    id: string;
}

export default function LanguagePage() {
    const [selectedLang, setSelectedLang] = useState('ar');

    const languages: LanguageOption[] = [
        { id: 'ar', code: 'PS', name: 'العربية', nativeName: 'Arabic' },
        { id: 'en', code: 'GB', name: 'English', nativeName: 'English' },
        { id: 'fr', code: 'FR', name: 'Français', nativeName: 'French' },
        { id: 'de', code: 'DE', name: 'Deutsch', nativeName: 'German' },
        { id: 'es', code: 'ES', name: 'Español', nativeName: 'Spanish' },
        { id: 'it', code: 'IT', name: 'Italiano', nativeName: 'Italian' },
    ];

    return (
        <main className="pt-32 pb-24 px-6 min-h-screen md:px-24 bg-white">
            <div className="container mx-auto max-w-2xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-[#F9F4F4] rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold font-serif text-[#671618] mb-2">اختر اللغة</h1>
                    <p className="text-secondary opacity-60 font-english uppercase tracking-widest text-sm">
                        Choose Your Preferred Language
                    </p>
                </div>

                {/* Language List */}
                <div className="space-y-4 mb-12">
                    {languages.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => setSelectedLang(lang.id)}
                            className={`w-full flex items-center justify-between p-6 rounded-lg border-2 smooth-transition group ${selectedLang === lang.id
                                ? 'border-[#671618] bg-[#FAF7F7]'
                                : 'border-transparent hover:border-gray-200 bg-white shadow-sm'
                                }`}
                        >

                            <div className="flex items-center gap-4 flex-row-reverse w-full">
                                <div className="text-right flex-1">
                                    <div className="font-bold text-lg text-gray-900">{lang.name}</div>
                                    <div className="text-sm text-gray-500 font-english">{lang.nativeName}</div>
                                </div>
                                <div className="text-2xl font-bold text-gray-800 font-english w-12 text-center">
                                    {lang.code}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {selectedLang === lang.id && (
                                    <div className="w-6 h-6 bg-[#671618] rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="bg-[#FAF9F6] p-4 rounded-lg text-center mb-8">
                    <p className="text-gray-500 text-xs leading-relaxed">
                        <span className="text-[#671618] mx-1">●</span>
                        ملاحظة: هذه الصفحة هي نموذج عرض فقط. وظيفة تغيير اللغة غير مفعلة حالياً في النسخة التجريبية.
                        <br />
                        <span className="font-english opacity-70 block mt-1">
                            Note: This is a display page only. The language change functionality is not currently active in the demo version.
                        </span>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Link
                        href="/"
                        className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 font-semibold rounded-none hover:bg-gray-50 text-center smooth-transition"
                    >
                        إلغاء / Cancel
                    </Link>
                    <button className="flex-1 py-4 bg-[#671618] text-white font-semibold rounded-none hover:bg-[#500000] smooth-transition text-center">
                        حفظ التغييرات / Save Changes
                    </button>
                </div>

                <p className="text-center text-xs text-gray-300 mt-8 font-english">
                    We are working on supporting additional languages soon
                </p>
            </div>
        </main>
    );
}
