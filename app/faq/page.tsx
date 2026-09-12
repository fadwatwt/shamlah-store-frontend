'use client';

import { useState } from 'react';
import Link from 'next/link';
import PolicyLayout from '../components/PolicyLayout';
import { useLanguage } from '../context/LanguageContext';

export default function FaqPage() {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const content = t.infoPages.faq;

    return (
        <PolicyLayout title={content.title} subtitle={content.subtitle}>
            <div className="divide-y divide-gray-100 border-y border-gray-100">
                {content.items.map((item, i) => {
                    const open = openIndex === i;
                    return (
                        <div key={i}>
                            <button
                                onClick={() => setOpenIndex(open ? null : i)}
                                aria-expanded={open}
                                className="w-full py-5 flex justify-between items-center gap-4 text-start group"
                            >
                                <span className={`font-medium text-lg transition-colors ${open ? 'text-accent' : 'text-gray-900 group-hover:text-accent'}`}>
                                    {item.q}
                                </span>
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${open ? 'border-accent text-accent rotate-45' : 'border-gray-200 text-gray-400'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </span>
                            </button>
                            {open && (
                                <p className="pb-6 text-gray-600 leading-loose font-light">
                                    {item.a}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Contact CTA */}
            <div className="mt-12 md:mt-16 text-center bg-secondary rounded-lg px-6 py-10">
                <h2 className="text-2xl font-serif text-accent mb-3">
                    {content.contactTitle}
                </h2>
                <p className="text-gray-600 font-light mb-6">
                    {content.contactText}
                </p>
                <Link
                    href="/contact"
                    className="inline-block border-2 border-accent text-accent px-10 py-3 font-semibold smooth-transition hover:bg-accent hover:text-white"
                >
                    {content.contactButton}
                </Link>
            </div>
        </PolicyLayout>
    );
}
