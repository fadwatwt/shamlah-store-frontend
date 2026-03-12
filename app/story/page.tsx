'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';

const HERO_SLIDES = [
    '/b560acf3b2086c012954bece6fa33fec22882962.webp',
    '/hero-embroidery.png',
    '/c55a82c55d4a03a5e021e554af49768bda4fa39a.webp',
];

export default function StoryPage() {
    const { t } = useLanguage();
    // No more slider needed, using static layout


    return (
        <main className="pt-20 flex flex-col gap-16 md:gap-20">
            {/* Hero Section */}
            <section className="relative flex items-center h-[80vh] justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero-embroidery.png"
                        alt="Our Story Hero"
                        fill
                        className="object-cover"
                        priority
                        quality={100}
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                <div className="relative z-10 text-center text-white px-6 mt-16 max-w-4xl mx-auto flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-serif mb-6 tracking-wide text-white">
                        {t.storyPage.hero.title}
                    </h1>
                    <p className="text-lg md:text-xl font-light tracking-wider leading-relaxed">
                        {t.storyPage.hero.subtitle}
                    </p>
                    <div className="w-[1px] h-12 bg-white/70 mt-12 mb-2"></div>
                </div>
            </section>

            <div className='px-20'>
                {/* Intro Section */}
                <section className="py-20 md:py-24 container-custom">
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                        <div className="md:w-5/12 relative h-[450px] md:h-[550px] w-full">
                            <Image
                                src="/c55a82c55d4a03a5e021e554af49768bda4fa39a.webp"
                                alt="Woman looking at view with scarf"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="md:w-6/12 text-start">
                            <h2 className="text-3xl md:text-5xl font-serif text-accent mb-8 leading-tight whitespace-pre-line">
                                {t.storyPage.intro.title}
                            </h2>
                            <div className="text-gray-600 space-y-6 form-light leading-relaxed text-lg">
                                <p>{t.storyPage.intro.text1}</p>
                                <p>{t.storyPage.intro.text2}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values/Features - Updated Design */}
                <section className="py-16 bg-white">
                    <div className="container-custom">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-serif text-accent">{t.storyPage.values.title}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center max-w-5xl mx-auto">
                            {/* Authenticity */}
                            <div className="flex flex-col items-center group p-6">
                                <div className="w-12 h-12 mb-6 text-accent">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-90 group-hover:scale-110 transition-transform duration-300">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-serif mb-4 text-gray-900">{t.storyPage.values.authenticity.title}</h3>
                                <p className="text-gray-500 font-light text-sm leading-relaxed max-w-xs mx-auto">
                                    {t.storyPage.values.authenticity.desc}
                                </p>
                            </div>

                            {/* Craftsmanship */}
                            <div className="flex flex-col items-center group p-6 border-l border-r border-gray-100">
                                <div className="w-12 h-12 mb-6 text-accent">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-90 group-hover:scale-110 transition-transform duration-300">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5l7-7-1.41-1.41L9 11.67l-2.59-2.58L5 10.5l4 4z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-serif mb-4 text-gray-900">{t.storyPage.values.craftsmanship.title}</h3>
                                <p className="text-gray-500 font-light text-sm leading-relaxed max-w-xs mx-auto">
                                    {t.storyPage.values.craftsmanship.desc}
                                </p>
                            </div>

                            {/* Luxury */}
                            <div className="flex flex-col items-center group p-6">
                                <div className="w-12 h-12 mb-6 text-accent">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-90 group-hover:scale-110 transition-transform duration-300">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 19.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.4z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-serif mb-4 text-gray-900">{t.storyPage.values.luxury.title}</h3>
                                <p className="text-gray-500 font-light text-sm leading-relaxed max-w-xs mx-auto">
                                    {t.storyPage.values.luxury.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Craft Section */}
                <section className="py-20 md:py-24 px-6 container-custom">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
                        <div className="md:w-5/12 text-start">
                            <h2 className="text-3xl md:text-4xl font-serif text-accent mb-8 leading-tight">
                                {t.storyPage.craft.title}
                            </h2>
                            <div className="text-gray-600 space-y-6 leading-relaxed font-light text-lg">
                                <p>{t.storyPage.craft.text1}</p>
                                <p>{t.storyPage.craft.text2}</p>
                            </div>
                        </div>
                        <div className="md:w-5/12 relative h-[450px] md:h-[550px] w-full">
                            <Image
                                src="/20691b5b69cc1d04b222aa775f53f947487383a1.webp"
                                alt="Palestinian Embroidery threads close up"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Quote Section */}
                <section className="py-24 px-6 text-center bg-white flex flex-col items-center">
                    <div className="mb-8">
                        <Image
                            src="/image2.png"
                            alt="Separator"
                            width={24}
                            height={24}
                            className="object-contain opacity-80"
                        />
                    </div>
                    <div className="container mx-auto max-w-3xl">
                        <h2 className="text-2xl md:text-3xl leading-relaxed text-gray-800 font-serif mb-12">
                            {t.storyPage.quote}
                        </h2>
                        <div className="w-[80vw] max-w-[400px] h-[1px] bg-gray-200 mx-auto"></div>
                    </div>
                </section>

                {/* CTA */}
                <section className="pb-32 pt-10 text-center bg-white">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-serif mb-10 text-accent">{t.storyPage.cta.title}</h2>
                        <Link
                            href="/collections"
                            className="inline-block border-2 border-accent text-accent px-12 py-3 font-semibold smooth-transition hover:bg-accent hover:text-white"
                        >
                            {t.storyPage.cta.button}
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
