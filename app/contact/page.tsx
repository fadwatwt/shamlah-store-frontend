'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const WhatsAppIcon = () => (
    <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const MailIcon = () => (
    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

function getContactPage(language: string) {
    return translations[language as 'ar' | 'en']?.contactPage ?? translations.en.contactPage;
}

export default function ContactPage() {
    const { dir, language } = useLanguage();
    const cp = getContactPage(language);

    // WhatsApp + email strip (online store — no address or working hours).
    // Same number source as the floating button: set NEXT_PUBLIC_WHATSAPP_NUMBER.
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '970000000000';
    const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        language === 'ar' ? 'مرحباً، لدي استفسار' : 'Hello, I have a question'
    )}`;
    const contactEmail = 'info@shmlh.com';

    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!formData.name.trim()) e.name = cp.form.error;
        if (!formData.email.trim()) e.email = cp.form.error;
        if (!formData.phone.trim()) e.phone = cp.form.error;
        if (!formData.message.trim()) e.message = cp.form.error;
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            e.email = dir === 'rtl' ? 'البريد الإلكتروني غير صالح' : 'Invalid email address';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess('');
        if (!validate()) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 900));
        setLoading(false);
        setSuccess(cp.form.success);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setErrors({});
        setTimeout(() => setSuccess(''), 4000);
    };

    return (
        <main className="min-h-screen bg-[#FDFBF7] pt-24 md:pt-28" dir={dir}>
            {/* Hero Section */}
            <section className="text-center px-4 py-10 md:py-14 lg:py-16 bg-[#FDFBF7]">
                <div className="flex justify-center mb-4">
                    <Image src="/image.png" alt="" width={28} height={28} className="object-contain" />
                </div>
                <h1 className="text-[28px] md:text-4xl lg:text-5xl font-serif text-accent mb-3 tracking-wide">
                    {cp.hero.title}
                </h1>
                <p className="text-gray-500 text-sm md:text-base font-light">
                    {cp.hero.subtitle}
                </p>
            </section>

            {/* Content Section — form first and centered */}
            <section className="bg-[#F5F1EB] md:bg-[#F5F1EB] px-4 md:px-6 lg:px-8 xl:px-12 py-6 md:py-8 lg:py-10">
                <div className="max-w-2xl mx-auto">
                    {/* Form Card */}
                    <div className="bg-white p-6 md:p-8 lg:p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                            <Image src="/image.png" alt="" width={28} height={28} className="object-contain shrink-0" />
                            <h2 className="text-lg md:text-xl font-serif text-accent">
                                {cp.form.title}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-800 block">
                                    {cp.form.name}
                                </label>
                                <input
                                    type="text"
                                    placeholder={cp.form.namePlaceholder}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full border ${errors.name ? 'border-red-400' : 'border-gray-200'} rounded-sm px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-all bg-white`}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-800 block">
                                    {cp.form.email}
                                </label>
                                <input
                                    type="email"
                                    placeholder={cp.form.emailPlaceholder}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`w-full border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-sm px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-all bg-white`}
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-800 block">
                                    {cp.form.phone}
                                </label>
                                <input
                                    type="tel"
                                    placeholder={cp.form.phonePlaceholder}
                                    dir="ltr"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className={`w-full border ${errors.phone ? 'border-red-400' : 'border-gray-200'} rounded-sm px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-all bg-white ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                                    style={{ direction: 'ltr' }}
                                />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-800 block">
                                    {cp.form.message}
                                </label>
                                <textarea
                                    placeholder={cp.form.messagePlaceholder}
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className={`w-full border ${errors.message ? 'border-red-400' : 'border-gray-200'} rounded-sm px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-all bg-white resize-none`}
                                />
                                {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                            </div>

                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-sm">
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-accent text-white py-3.5 md:py-4 text-sm font-medium hover:bg-[#5a1c20] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? cp.form.sending : cp.form.send}
                                {!loading && (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Quick contact strip — WhatsApp + email only */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="bg-white border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-center gap-2.5 text-sm text-gray-700 hover:border-accent hover:text-accent transition-colors"
                        >
                            <WhatsAppIcon />
                            <span dir="ltr">+{whatsappNumber}</span>
                        </a>
                        <a
                            href={`mailto:${contactEmail}`}
                            className="bg-white border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-center gap-2.5 text-sm text-gray-700 hover:border-accent hover:text-accent transition-colors"
                        >
                            <MailIcon />
                            <span dir="ltr">{contactEmail}</span>
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
