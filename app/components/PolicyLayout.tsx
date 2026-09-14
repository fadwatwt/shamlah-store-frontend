'use client';

import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';

export interface PolicySection {
    heading: string;
    paragraphs: string[];
    list?: string[];
}

interface PolicyLayoutProps {
    title: string;
    subtitle: string;
    showUpdated?: boolean;
    children: React.ReactNode;
}

/* Shared identity for all policy/info pages:
   separator ornament + serif accent title + subtitle, then content. */
export default function PolicyLayout({ title, subtitle, showUpdated, children }: PolicyLayoutProps) {
    const { t, dir } = useLanguage();

    return (
        <main className="pt-28 md:pt-32 pb-12 md:pb-24 px-6 min-h-screen bg-white" dir={dir}>
            <div className="container mx-auto max-w-3xl">
                {/* Page Hero */}
                <div className="text-center mb-10 md:mb-14">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/image2.png"
                            alt="Separator"
                            width={32}
                            height={32}
                            className="object-contain opacity-80"
                        />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-accent mb-4">
                        {title}
                    </h1>
                    <p className="text-gray-600 text-base max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                    {showUpdated && (
                        <p className="text-gray-400 text-xs mt-4" suppressHydrationWarning>
                            {t.infoPages.updated}: {new Date().getFullYear()}
                        </p>
                    )}
                </div>

                {children}
            </div>
        </main>
    );
}

/* Standard policy body: numbered serif sections with paragraphs + bullets */
export function PolicyBody({ sections }: { sections: PolicySection[] }) {
    const { dir } = useLanguage();

    return (
        <div className="space-y-10 md:space-y-12">
            {sections.map((section, i) => (
                <section key={i} className="border-b border-gray-100 pb-10 md:pb-12 last:border-0">
                    <h2 className="text-2xl font-serif text-accent mb-4">
                        {section.heading}
                    </h2>
                    <div className="space-y-4 text-gray-600 leading-loose font-light">
                        {section.paragraphs.map((p, j) => (
                            <p key={j}>{p}</p>
                        ))}
                    </div>
                    {section.list && section.list.length > 0 && (
                        <ul className={`mt-4 space-y-2 text-gray-600 font-light leading-relaxed list-disc ${dir === 'rtl' ? 'pr-5' : 'pl-5'}`}>
                            {section.list.map((item, k) => (
                                <li key={k}>{item}</li>
                            ))}
                        </ul>
                    )}
                </section>
            ))}
        </div>
    );
}
