'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const TatreezIcon = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent">
        <path d="M14 2L15.5 8.5L21 4L18.5 10L26 12L19.5 14.5L26 17L18.5 19L21 25L15.5 20.5L14 27L12.5 20.5L7 25L9.5 19L2 17L8.5 14.5L2 12L9.5 10L7 4L12.5 8.5L14 2Z" fill="currentColor" opacity="0.9" />
        <circle cx="14" cy="14" r="3" fill="white" />
        <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    </svg>
);

const LocationIcon = () => (
    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const PhoneIcon = () => (
    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
        <main className="min-h-screen bg-[#FDFBF7] pt-16 md:pt-20" dir={dir}>
            {/* Hero Section */}
            <section className="text-center px-4 py-10 md:py-14 lg:py-16 bg-[#FDFBF7]">
                <div className="flex justify-center mb-4">
                    <div className="w-2 h-2 bg-[#E8D5C4] rotate-0"></div>
                </div>
                <h1 className="text-[28px] md:text-4xl lg:text-5xl font-serif text-accent mb-3 tracking-wide">
                    {cp.hero.title}
                </h1>
                <p className="text-gray-500 text-sm md:text-base font-light">
                    {cp.hero.subtitle}
                </p>
            </section>

            {/* Content Section */}
            <section className="bg-[#F5F1EB] md:bg-[#F5F1EB] px-4 md:px-6 lg:px-8 xl:px-12 py-6 md:py-8 lg:py-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                    {/* Form Card */}
                    <div className="bg-white p-6 md:p-8 lg:p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                            <TatreezIcon />
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

                    {/* Contact Info Card */}
                    <div className="bg-white p-6 md:p-8 lg:p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                            <TatreezIcon />
                            <h2 className="text-lg md:text-xl font-serif text-accent">
                                {cp.info.title}
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-9 h-9 border border-gray-200 rounded flex items-center justify-center flex-shrink-0 bg-white">
                                    <LocationIcon />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">{cp.info.address}</p>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {cp.info.addressLine1}
                                        <br />
                                        {cp.info.addressLine2}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-9 h-9 border border-gray-200 rounded flex items-center justify-center flex-shrink-0 bg-white">
                                    <PhoneIcon />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">{cp.info.phone}</p>
                                    <p className="text-sm text-gray-500 leading-relaxed" dir="ltr">
                                        +970 XX XXX XXXX
                                        <br />
                                        +970 XX XXX XXXX
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-9 h-9 border border-gray-200 rounded flex items-center justify-center flex-shrink-0 bg-white">
                                    <MailIcon />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">{cp.info.email}</p>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        info@shmlh.com
                                        <br />
                                        support@shmlh.com
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <p className="text-sm font-semibold text-gray-900 mb-4">{cp.info.hours}</p>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{cp.info.hoursData.sunThu}</span>
                                        <span className="text-gray-700 font-medium" dir="ltr">{cp.info.hoursData.sunThuTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{cp.info.hoursData.saturday}</span>
                                        <span className="text-gray-700 font-medium" dir="ltr">{cp.info.hoursData.saturdayTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{cp.info.hoursData.friday}</span>
                                        <span className="text-gray-700 font-medium text-accent">{cp.info.hoursData.fridayTime}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
