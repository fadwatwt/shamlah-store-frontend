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
    const [activeSlide, setActiveSlide] = useState(0);

    // Auto-rotating hero slider (pauses on hover via CSS group? timer-based)
    useEffect(() => {
        if (HERO_SLIDES.length < 2) return;
        const id = setInterval(() => {
            setActiveSlide((s) => (s + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(id);
    }, []);


    return (
        <main className="pt-28 flex flex-col gap-8 md:gap-16 lg:gap-20">
            {/* Hero Section — multi-image slider */}
            <section className="relative flex items-center h-[80vh] justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {HERO_SLIDES.map((src, i) => (
                        <Image
                            key={src}
                            src={src}
                            alt="Our Story Hero"
                            fill
                            className={`object-cover transition-opacity duration-1000 ${i === activeSlide ? 'opacity-100' : 'opacity-0'}`}
                            priority={i === 0}
                            quality={100}
                        />
                    ))}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                <div className="relative z-10 text-center text-white px-6 mt-16 max-w-4xl mx-auto flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-serif mb-6 tracking-wide text-white">
                        {t.storyPage.hero.title}
                    </h1>
                    <p className="text-lg md:text-xl font-light tracking-wider leading-relaxed">
                        {t.storyPage.hero.subtitle}
                    </p>
                </div>
                {/* Slider dots — bottom of hero */}
                {HERO_SLIDES.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                        {HERO_SLIDES.map((src, i) => (
                            <button
                                key={src}
                                onClick={() => setActiveSlide(i)}
                                aria-label={`Slide ${i + 1}`}
                                className={`h-1 rounded-full transition-all duration-300 ${i === activeSlide ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/70'}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            <div className='px-4 md:px-10 lg:px-20'>
                {/* Intro Section */}
                <section className="py-10 md:py-20 lg:py-24 container-custom">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
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

                {/* Values/Features - Figma Design */}
                <section className="py-8 md:py-16 bg-white">
                    <div className="container-custom">
                        <div className="w-full h-px bg-[#EDE3D3] mb-12 md:mb-16"></div>
                        <div className="text-center mb-10 md:mb-14">
                            <h2 className="text-3xl md:text-[32px] font-serif text-accent tracking-wide">{t.storyPage.values.title}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 text-center max-w-6xl mx-auto">
                            {/* Authenticity — نفس أيقونة المتجر */}
                            <div className="flex flex-col items-center">
                                <div className="w-9 h-9 mb-5">
                                    <Image
                                        src="/image2.png"
                                        alt=""
                                        width={36}
                                        height={36}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h3 className="text-[17px] font-serif mb-4 text-[#1a1a1a]">{t.storyPage.values.authenticity.title}</h3>
                                <p className="font-serif font-light text-[14.5px] leading-[1.9] text-[#333] max-w-[300px] mx-auto">
                                    {t.storyPage.values.authenticity.desc}
                                </p>
                            </div>

                            {/* Craftsmanship — شجرة بنفس ستايل التطريز */}
                            <div className="flex flex-col items-center">
                                <div className="w-9 h-9 mb-5">
                                    <Image
                                        src="/image4.png"
                                        alt=""
                                        width={36}
                                        height={36}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h3 className="text-[17px] font-serif mb-4 text-[#1a1a1a]">{t.storyPage.values.craftsmanship.title}</h3>
                                <p className="font-serif font-light text-[14.5px] leading-[1.9] text-[#333] max-w-[300px] mx-auto">
                                    {t.storyPage.values.craftsmanship.desc}
                                </p>
                            </div>

                            {/* Luxury — نفس أيقونة المتجر */}
                            <div className="flex flex-col items-center">
                                <div className="w-9 h-9 mb-5">
                                    <Image
                                        src="/image.png"
                                        alt=""
                                        width={36}
                                        height={36}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h3 className="text-[17px] font-serif mb-4 text-[#1a1a1a]">{t.storyPage.values.luxury.title}</h3>
                                <p className="font-serif font-light text-[14.5px] leading-[1.9] text-[#333] max-w-[300px] mx-auto">
                                    {t.storyPage.values.luxury.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Craft Section */}
                <section className="py-10 md:py-20 lg:py-24 px-6 container-custom">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16">
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
                <section className="py-12 md:py-24 px-6 text-center bg-white flex flex-col items-center">
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
                <section className="pb-12 md:pb-32 pt-6 md:pt-10 text-center bg-white">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-serif mb-6 text-accent">{t.storyPage.cta.title}</h2>
                        <p className="text-gray-600 text-sm leading-relaxed max-w-xl mx-auto mb-8 md:mb-10">
                            {t.storyPage.cta.text}
                        </p>
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
