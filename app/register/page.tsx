'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const { t, dir } = useLanguage();
    const { register } = useAuth();

    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI state
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (password !== confirmPassword) {
            setError(dir === 'rtl' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
            return;
        }

        setIsRegistering(true);
        try {
            // Note: Currently we only send email/password/redirectUrl/channel
            // Additional fields (name, phone, city) would need profile update after login
            const result = await register({
                email,
                password,
                redirectUrl: window.location.origin + '/login',
                channel: process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel'
            });

            if (!result.success) {
                setError(result.error || 'Registration failed');
            } else {
                setSuccess(true);
                // Optional: Clear form
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            setError(dir === 'rtl' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <main className="min-h-screen pt-32 pb-20 md:px-24 bg-white" dir={dir}>
            <div className="container mx-auto px-6 lg:px-12">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-accent font-serif mb-4">{t.auth.registerTitle}</h1>
                    <p className="text-gray-500">{t.home.newCollectionSub}</p>
                </div>

                {/* Form Container */}
                <div className="bg-[#F9F4F4] max-w-2xl mx-auto rounded-lg p-8 md:p-12 mb-16">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm text-center">
                                {t.auth.registerSuccess} <Link href="/login" className="font-bold underline">{t.auth.loginLink}</Link>
                            </div>
                        )}

                        {/* Full Name - Not sent to Saleor in basic register, needed for profile update later */}
                        <div>
                            <label className="block text-gray-500 text-sm mb-2 text-start">{t.profile.fullName} *</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-start bg-white pr-10"
                                    placeholder={t.profile.fullName}
                                    required
                                />
                                <div className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-3' : 'left-3'} text-gray-400`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-gray-500 text-sm mb-2 text-start">{t.profile.email} *</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-start bg-white pr-10"
                                    placeholder="example@email.com"
                                    required
                                />
                                <div className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-3' : 'left-3'} text-gray-400`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Phone - Not sent in basic auth */}
                        <div>
                            <label className="block text-gray-500 text-sm mb-2 text-start">{t.profile.phone} *</label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-start bg-white pr-10"
                                    placeholder="+970 XXX XXX XXX"
                                    dir="ltr"
                                />
                                <div className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-3' : 'left-3'} text-gray-400`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* City - Not sent in basic auth */}
                        <div>
                            <label className="block text-gray-500 text-sm mb-2 text-start">{t.profile.city} *</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-start bg-white pr-10"
                                    placeholder={t.profile.city}
                                />
                                <div className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-3' : 'left-3'} text-gray-400`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-gray-500 text-sm mb-2 text-start">{t.auth.password} *</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-start bg-white pr-10"
                                    placeholder="........"
                                    required
                                />
                                <div className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-3' : 'left-3'} text-gray-400`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-gray-500 text-sm mb-2 text-start">{t.auth.confirmPassword} *</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-start bg-white pr-10"
                                    placeholder="........"
                                    required
                                />
                                <div className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-3' : 'left-3'} text-gray-400`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="terms" className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent" required />
                            <label htmlFor="terms" className="text-sm text-gray-500 cursor-pointer select-none">
                                {dir === 'rtl' ? 'أوافق على ' : 'I agree to '}
                                <Link href="#" className="text-accent hover:underline">
                                    {t.footer.links_label.terms}
                                </Link>
                                {dir === 'rtl' ? ' و ' : ' and '}
                                <Link href="#" className="text-accent hover:underline">
                                    {t.footer.links_label.privacy}
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isRegistering}
                            className="w-full bg-accent text-white font-bold py-3.5 rounded-md hover:bg-[#500000] smooth-transition shadow-lg shadow-accent/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isRegistering ? 'Registering...' : t.auth.registerButton}
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-gray-500 text-sm">
                                {t.auth.haveAccount}{' '}
                                <Link href="/login" className="text-accent font-bold hover:underline">
                                    {t.auth.loginLink}
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Features Footer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="text-center group">
                        <div className="w-16 h-16 bg-[#F9F4F4] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent group-hover:text-white smooth-transition text-accent">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{t.orders.trackOrder}</h3>
                        <p className="text-sm text-gray-500">{dir === 'rtl' ? 'تتبع طلباتك بسهولة في أي وقت' : 'Track your orders easily at any time'}</p>
                    </div>
                    <div className="text-center group">
                        <div className="w-16 h-16 bg-[#F9F4F4] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent group-hover:text-white smooth-transition text-accent">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{t.wishlist.title}</h3>
                        <p className="text-sm text-gray-500">{dir === 'rtl' ? 'احفظ منتجاتك المفضلة لوقت لاحق' : 'Save your favorite items for later'}</p>
                    </div>
                    <div className="text-center group">
                        <div className="w-16 h-16 bg-[#F9F4F4] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent group-hover:text-white smooth-transition text-accent">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{t.footer.links_label.shipping}</h3>
                        <p className="text-sm text-gray-500">{dir === 'rtl' ? 'استمتع بخدمة الشحن السريع والآمن' : 'Enjoy fast and secure shipping service'}</p>
                    </div>
                </div>

            </div>
        </main>
    );
}
