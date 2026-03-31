'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { language, setLanguage, t } = useLanguage();

    const sections = [
        {
            title: t.footer.sections.about,
            links: [
                { label: t.footer.links_label.story, href: '/story' },
                { label: t.footer.links_label.contact, href: '/contact' },
            ],
        },
        {
            title: t.footer.sections.help,
            links: [
                { label: t.footer.links_label.shipping, href: '/shipping' },
                { label: t.footer.links_label.returns, href: '/returns' },
                { label: t.footer.links_label.faq, href: '/faq' },
            ],
        },
    ];

    return (
        <footer className="bg-secondary border-t border-gray-100 py-16 px-20">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Logo & Slogan */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="relative block w-32 h-10 mb-6">
                            <Image
                                src="/logo.png"
                                alt="SHMLH"
                                fill
                                className="object-contain"
                            />
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            {t.footer.description}
                        </p>
                    </div>

                    {/* Navigation Sections */}
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-6">
                                {section.title}
                            </h4>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-600 hover:text-accent smooth-transition text-sm"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Social */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-6">
                            {t.footer.sections.followUs}
                        </h4>
                        <div className="flex gap-4">
                            {['Instagram', 'Facebook', 'Twitter'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-accent hover:text-white smooth-transition"
                                    aria-label={social}
                                >
                                    <span className="sr-only">{social}</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-400 text-xs text-center md:text-start">
                        &copy; {new Date().getFullYear()} SHMLH. All rights reserved.
                    </p>

                    <div className="flex items-center gap-8 flex-wrap justify-center">
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-gray-400 hover:text-accent text-[11px] font-medium">Privacy Policy</Link>
                            <Link href="/terms" className="text-gray-400 hover:text-accent text-[11px] font-medium">Terms of Use</Link>
                        </div>

                        {/* Language Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 smooth-transition text-[11px] font-medium py-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2.001 2.001 0 004.516-1.068C17.447 4.252 12.959 2 8 2c-1.31 0-2.573.235-3.745.666a2.01 2.01 0 011.025 1.269z" />
                                </svg>
                                <span>{language === 'ar' ? 'العربية' : 'English'}</span>
                                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute bottom-full end-0 pb-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 smooth-transition">
                                <div className="bg-white shadow-xl border border-gray-100 rounded-lg min-w-[150px] overflow-hidden">
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 smooth-transition ${language === 'en' ? 'text-accent bg-gray-50/50' : 'text-gray-600'}`}
                                    >
                                        <span className="text-xs text-gray-400 w-4">US</span>
                                        <span>English</span>
                                    </button>
                                    <button
                                        onClick={() => setLanguage('ar')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 smooth-transition ${language === 'ar' ? 'text-accent bg-gray-50/50' : 'text-gray-600'}`}
                                    >
                                        <span className="text-xs text-gray-400 w-4">PS</span>
                                        <span className="font-arabic">العربية</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
